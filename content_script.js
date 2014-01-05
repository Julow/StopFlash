/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * content_script.js
 */

function FlashFinder()
{
    this.flashElements = [];

    var elements = document.getElementsByTagName('*');

    for(var i = 0, e; i < elements.length; ++i)
    {
        e = elements[i];

        if(e.nodeName === 'OBJECT')
        {
            this.flashElements.push(new FlashElement(e));
        }
    }
}

var styles = [
    'float', 'clear',
    'position', 'top', 'left',
    'display', 'width', 'height',
    'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top', 'border-right', 'border-bottom', 'border-left'
]; // :Array<String>

function FlashElement(element)
{
    this.element = element; // :HTMLElement
    this.parent = element.parentNode; // :HTMLElement
    this.nextSibling = element.nextSibling; // :HTMLElement

    var self = this;

    this.replacement = new Builder('div')
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
        this.replacement.css(styles[i], Builder.getStyle(element, styles[i]));
    }
}
FlashElement.prototype.block = function()
{
    this.parent.removeChild(this.element);

    if(this.nextSibling != null)
    {
        this.parent.insertBefore(this.replacement, this.nextSibling);
    }
    else
    {
        this.parent.appendChild(this.replacement);
    }
};
FlashElement.prototype.unblock = function()
{
    this.parent.removeChild(this.replacement);

    if(this.nextSibling != null)
    {
        this.parent.insertBefore(this.element, this.nextSibling);
    }
    else
    {
        this.parent.appendChild(this.element);
    }
};

// main
new FlashFinder();
