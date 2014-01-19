/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * content_script.js
 */

// function isFlash(HTMLElement element):boolean
var isFlash = function(element)
{
    return (element.nodeName === 'OBJECT' || element.nodeName === 'EMBED');
};

// class FlashCollection
function FlashCollection(doc)
{
    this.flashElements = []; // :Array<FlashElement>

    this.port = chrome.runtime.connect({'name': 'stopflashContentScript'}); // :chrome.runtime.Port

    this.elementId = 0; // :int

    this.whitelist = []; // :Array<String>
    this.isWhitelist = false; // :boolean

    this.id = 0; // :int

    var self = this;

    this.port.onMessage.addListener(function(req)
    {
        if(req['stopflashWhitelist'])
        {
            self.whitelist = req['stopflashWhitelist'];
            self.isWhitelist = req['stopflashIsWhitelist'];
            self.id = req['stopflashCollectionId'];

            // init
            self.add(doc.getElementsByTagName('OBJECT'));
            self.add(doc.getElementsByTagName('EMBED'));

            self.sendData();
        }

        if(req['stopflashBlock'])
        {
            var e = self.getById(req['stopflashBlock'].id);

            if(e != null)
            {
                e.block();

                self.sendData();
            }
        }

        if(req['stopflashUnblock'])
        {
            var e = self.getById(req['stopflashUnblock'].id);

            if(e != null)
            {
                e.unblock();

                self.sendData();
            }
        }
    });

    this.port.postMessage({'stopflashInit': true, 'stopflashIsMainFrame': (window == window.top)});

    var observer = new MutationObserver(function(changes)
    {
        var changed = false;

        for(var i = 0, c; i < changes.length; ++i)
        {
            c = changes[i];

            if(c.addedNodes != null)
            {
                changed = (self.add(c.addedNodes) || false);
            }

            if(c.removedNodes != null)
            {
                changed = (self.remove(c.removedNodes) || false);
            }
        }

        if(changed)
        {
            self.sendData();
        }
    });

    observer.observe(doc, {childList: true, subtree: true});

    this.sendData();
}
// function sendData():void
FlashCollection.prototype.sendData = function()
{
    var data = [];

    for(var i = 0; i < this.flashElements.length; ++i)
    {
        data.push(this.flashElements[i].getData());
    }

    this.port.postMessage({'stopflashDataUpdate': true, 'stopflashData': data, 'stopflashCollectionId': this.id});
};
// function add(NodeList elements):boolean
FlashCollection.prototype.add = function(elements)
{
    var changed = false;

    for(var i = 0, e; i < elements.length; ++i)
    {
        e = elements[i];

        if(isFlash(e))
        {
            var parent = e;

            while(parent = parent.parentNode)
            {
                if(isFlash(parent))
                {
                    e = parent;
                }
            }

            var f = this.get(e);

            if(f == null)
            {
                f = new FlashElement(this, ++this.elementId, e);

                if(f.isValid())
                {
                    this.flashElements.push(f);

                    if(!f.isWhitelist() && !this.isWhitelist)
                    {
                        f.block();
                    }

                    changed = true;
                }
            }
            else
            {
                f.update();

                if(f.blocked)
                {
                    f.block();
                }
            }
        }
    }

    return changed;
};
// function remove(NodeList elements):boolean
FlashCollection.prototype.remove = function(elements)
{
    var changed = false;

    for(var i = 0, f; i < elements.length; ++i)
    {
        f = this.get(elements[i]);

        if(f != null && !f.blocked)
        {
            f.remove();

            changed = true;
        }
    }

    return changed;
};
// function get(HTMLElement element)
FlashCollection.prototype.get = function(element)
{
    for(var i = 0; i < this.flashElements.length; ++i)
    {
        if(element == this.flashElements[i].element)
        {
            return this.flashElements[i];
        }
    }

    return null;
};
// function getById(int id)
FlashCollection.prototype.getById = function(id)
{
    for(var i = 0; i < this.flashElements.length; ++i)
    {
        if(id === this.flashElements[i].id)
        {
            return this.flashElements[i];
        }
    }

    return null;
};

var styles = [
    'float', 'clear',
    'position', 'top', 'left',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top', 'border-right', 'border-bottom', 'border-left'
]; // :Array<String>

var iconSizes = [128, 64, 48]; // :Array<int>

// class FlashElement
function FlashElement(collection, id, element)
{
    this.collection = collection; // :FlashCollection

    this.id = id; // :int

    this.parent = element.parentNode; // :HTMLElement
    this.element = element; // :HTMLElement
    this.nextSibling = element.nextSibling; // :HTMLElement

    this.blocked = false; // :boolean

    var self = this;

    var width = parseInt(Builder.getStyle(element, 'width'));
    var height = parseInt(Builder.getStyle(element, 'height'));

    var size = 32;

    for(var i = 0, s; i < iconSizes.length; ++i)
    {
        s = iconSizes[i];

        if(s < width && s < height)
        {
            size = s;
            break;
        }
    }

    var replacement = new Builder('div')
        .css('display', 'block')
        .css('width', width +'px')
        .css('height', height +'px')
        .css('cursor', 'pointer')
        .css('min-width', '34px')
        .css('min-height', '34px')
        .css('background', '#333 url("'+ chrome.extension.getURL('icons/stopflash_'+ size +'.png') +'") center center no-repeat')
        .event('click', function()
        {
            self.unblock();

            self.collection.sendData();
        });

    for(var i = 0; i < styles.length; ++i)
    {
        replacement.css(styles[i], Builder.getStyle(element, styles[i]));
    }

    this.replacement = replacement.node; // :HTMLElement
}
// function isValid():boolean
FlashElement.prototype.isValid = function()
{
    return (this.parent != null && this.getUrl() != null);
};
// function getData():Object
FlashElement.prototype.getData = function()
{
    return {
        'collection': this.collection.id,
        'id': this.id,
        'type': this.element.nodeName,
        'url': this.getUrl(),
        'blocked': this.blocked,
        'whitelist': this.isWhitelist()
    };
};
// function isWhitelist():boolean
FlashElement.prototype.isWhitelist = function()
{
    var url = this.getUrl();

    for(var i = 0; i < this.collection.whitelist.length; ++i)
    {
        if(url.indexOf(this.collection.whitelist[i]) >= 0)
        {
            return true;
        }
    }

    return false;
};
// function getUrl():String
FlashElement.prototype.getUrl = function()
{
    if(this.element.nodeName === 'EMBED')
    {
        return this.element.src;
    }
    else if(this.element.nodeName === 'OBJECT')
    {
        if(this.element.data)
        {
            return this.element.data;
        }
        else
        {
            var child = this.element.firstChild;

            while(child != null)
            {
                if(child.nodeName === 'PARAM' && (child.name === 'src' || child.name === 'movie'))
                {
                    return child.value;
                }

                child = child.nextSibling;
            }
        }
    }

    return null;
};
// function update():void
FlashElement.prototype.update = function()
{
    if(this.element.parentNode)
    {
        this.parent = this.element.parentNode;
        this.nextSibling = this.element.nextSibling;
    }
    else if(this.replacement.parentNode)
    {
        this.parent = this.replacement.parentNode;
        this.nextSibling = this.replacement.nextSibling;
    }
};
// function block():void
FlashElement.prototype.block = function()
{
    this.blocked = true;

    this.parent.insertBefore(this.replacement, this.nextSibling);

    this.parent.removeChild(this.element);
};
// function unblock():void
FlashElement.prototype.unblock = function()
{
    this.blocked = false;

    this.parent.insertBefore(this.element, this.nextSibling);

    this.parent.removeChild(this.replacement);
};
// function remove():void
FlashElement.prototype.remove = function()
{
    if(this.replacement.parentNode)
    {
        this.replacement.parentNode.removeChild(this.replacement);
    }

    if(this.element.parentNode)
    {
        this.element.parentNode.removeChild(this.element);
    }
};

// main
var collection = null;

var main = function()
{
    collection = new FlashCollection(document);
};

document.addEventListener('DOMContentLoaded', main, false);
