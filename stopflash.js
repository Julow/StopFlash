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

    this.content = new Builder('div')
        .className('content')
        .append(new Builder('div')
            .className('tab')
            .text('Home tab'))
        .append(new Builder('div')
            .className('tab')
            .text('Whitelist tab'))
        .append(new Builder('div')
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
                    self.content.css('margin-left', '0px');
                }))
            .append(new Builder('a')
                .text('Whitelist')
                .event('click', function()
                {
                    self.content.css('margin-left', '-300px');
                }))
            .append(new Builder('a')
                .text('Options')
                .event('click', function()
                {
                    self.content.css('margin-left', '-600px');
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
        .insert(this));

    return this;
};
// function setTab(int index):void
StopFlashTabs.prototype.setTab = function(index)
{
    this.css('margin-left', '-'+ (index * 300) +'px');

    this.tabs[index].css('position', '');

    var self = this;

    setTimeout(function()
    {
        for(var i = 0; i < self.tabs.length; ++i)
        {
            if(i !== index)
            {
                self.tabs[i].css('position', 'absolute');
            }
        }
    }, 400);
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
