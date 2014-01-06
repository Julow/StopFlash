/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * stopflash.js
 */

// class StopFlashUI extends Builder
function StopFlashUI(elements)
{
    this.super('div');

    this.content = new StopFlashTabs()
        .className('content')
        .addTab(new Builder('div')
            .className('tab')
            .text('Home tab'))
        .addTab(new Builder('div')
            .className('tab')
            .text('Whitelist tab'))
        .addTab(new Builder('div')
            .className('tab')
            .text('Options tab'));

    var self = this;

    this.append(new Builder('div')
            .className('head')
            .text('StopFlash'))
        .append(new Builder('div')
            .className('menu')
            .append(new Builder('a')
                .text('Home')
                .event('click', function()
                {
                    self.content.setTab(0);
                }))
            .append(new Builder('a')
                .text('Whitelist')
                .event('click', function()
                {
                    self.content.setTab(1);
                }))
            .append(new Builder('a')
                .text('Options')
                .event('click', function()
                {
                    self.content.setTab(2);
                })))
        .append(this.content)
        .append(new Builder('div')
            .className('foot')
            .html('<a href="https://github.com/JWhile/StopFlash">https://github.com/JWhile/StopFlash</a>'))
}
fus.extend(StopFlashUI, Builder);

// class StopFlashTabs extends Builder
function StopFlashTabs()
{
    this.super('div');

    this.tabs = []; // :Array<Builder>
}
// function addTab(Builder builder)@Chainable
StopFlashTabs.prototype.addTab = function(builder)
{
    this.tabs.push(builder
        .className('tab')
        .css('left', (this.tabs.length * 300) +'px')
        .insert(this));

    if(this.tabs.length === 1)
    {
        this.setTab(0);
    }

    return this;
};
// function setTab(int index):void
StopFlashTabs.prototype.setTab = function(index)
{
    this.css('left', '-'+ (index * 300) +'px')
        .css('height', Builder.getStyle(this.tabs[index], 'height'));
};
fus.extend(StopFlashTabs, Builder);

// main
var main = function(elements)
{
    new StopFlashUI(elements)
        .insert(document.body);
};

chrome.tabs.query({'highlighted': true, 'currentWindow': true}, function(tabs)
{
    chrome.tabs.sendMessage(tabs[0].id, {'getElements': 'stopflash'}, main);
});
