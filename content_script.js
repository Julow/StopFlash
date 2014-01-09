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

    this.add(doc.getElementsByTagName('OBJECT'));
    this.add(doc.getElementsByTagName('EMBED'));

    this.port = chrome.runtime.connect({'name': 'stopflashContentScript'});

    var self = this;

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
            self.port.postMessage({'stopflashDataUpdate': true, 'stopflashData': self.getData()})
        }
    });

    observer.observe(doc, {childList: true, subtree: true});

    this.port.postMessage({'stopflashInit': true});
}
// function getData():Array<Object>
FlashCollection.prototype.getData = function()
{
    var datas = [];

    for(var i = 0; i < this.flashElements.length; ++i)
    {
        datas.push(this.flashElements[i].getData());
    }

    return datas;
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
                f = new FlashElement(e);

                this.flashElements.push(f);

                f.block();

                changed = true;
            }
            else if(f.blocked)
            {
                f.block();
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

        if(f != null)
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

var styles = [
    'float', 'clear',
    'position', 'top', 'left',
    'width', 'height',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top', 'border-right', 'border-bottom', 'border-left'
]; // :Array<String>

// class FlashElement
function FlashElement(element)
{
    this.element = element; // :HTMLElement
    this.nextSibling = element.nextSibling; // :HTMLElement

    this.blocked = false; // :boolean

    var self = this;

    var replacement = new Builder('div')
        .css('display', 'block')
        .css('cursor', 'pointer')
        .css('min-width', '64px')
        .css('min-height', '64px')
        .css('background', '#333 url("'+ chrome.extension.getURL('icons/stopflash_64.png') +'") center center no-repeat')
        .event('click', function()
        {
            self.unblock();
        });

    for(var i = 0; i < styles.length; ++i)
    {
        replacement.css(styles[i], Builder.getStyle(element, styles[i]));
    }

    this.replacement = replacement.node;
}
// function getData():Object
FlashElement.prototype.getData = function()
{
    return {
        'type': this.element.nodeName,
        'url': this.getUrl(),
        'blocked': this.blocked
    };
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
// function block():void
FlashElement.prototype.block = function()
{
    var parent = this.element.parentNode || this.replacement.parentNode;

    if(parent != null)
    {
        parent.insertBefore(this.replacement, this.nextSibling);

        parent.removeChild(this.element);
    }

    this.blocked = true;
};
// function unblock():void
FlashElement.prototype.unblock = function()
{
    var parent = this.replacement.parentNode || this.element.parentNode;

    if(parent != null)
    {
        parent.insertBefore(this.element, this.nextSibling);

        parent.removeChild(this.replacement);
    }

    this.blocked = false;
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
var main = function()
{
    var collection = new FlashCollection(document);
};

document.addEventListener('DOMContentLoaded', main, false);
