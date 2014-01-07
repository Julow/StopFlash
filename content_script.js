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
function FlashCollection()
{
    this.flashElements = []; // :Array<FlashElement>
}
// function add(NodeList elements)
FlashCollection.prototype.add = function(elements)
{
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
            }
            else if(f.blocked)
            {
                f.block();
            }
        }
    }
};
// function remove(NodeList elements)
FlashCollection.prototype.remove = function(elements)
{
    for(var i = 0, f; i < elements.length; ++i)
    {
        f = this.get(elements[i]);

        if(f != null)
        {
            f.remove();
        }
    }
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
// function block():void
FlashElement.prototype.block = function()
{
    this.element.parentNode.insertBefore(this.replacement, this.nextSibling);

    this.element.parentNode.removeChild(this.element);

    this.blocked = true;
};
// function unblock():void
FlashElement.prototype.unblock = function()
{
    this.replacement.parentNode.insertBefore(this.element, this.nextSibling);

    this.replacement.parentNode.removeChild(this.replacement);

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
    var elements = new FlashCollection();

    elements.add(document.getElementsByTagName('OBJECT'));
    elements.add(document.getElementsByTagName('EMBED'));

    var observer = new MutationObserver(function(changes)
    {
        for(var i = 0, c; i < changes.length; ++i)
        {
            c = changes[i];

            if(c.addedNodes != null)
            {
                elements.add(c.addedNodes);
            }

            if(c.removedNodes != null)
            {
                elements.remove(c.removedNodes);
            }
        }
    });

    observer.observe(document, {childList: true, subtree: true});

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
    {
        if(request.getElements === 'stopflash')
        {
            sendResponse(elements);
        }
    });
};

document.addEventListener('DOMContentLoaded', main, false);
