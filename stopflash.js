/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * stopflash.js
 */

// class StopFlashUI extends Builder
function StopFlashUI()
{
    this.super('div');

    this.mainTab = new Builder('div');

    this.content = new StopFlashTabs()
        .className('content')
        .addTab(mainTab)
        .addTab(new Builder('div')
            .text('Whitelist tab'))
        .addTab(new Builder('div')
            .text('Options tab'));

    var self = this;

    this.append(new Builder('div')
            .className('head')
            .append(new Builder('p')
                .className('logo')
                .html('<b>ST<img src="icons/stopflash_16.png" />P</b> <span>Flash</span>')))
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
            .html('<a href="https://github.com/JWhile/StopFlash">https://github.com/JWhile/StopFlash</a>'));
}
fus.extend(StopFlashUI, Builder);

// class StopFlashTabs extends Builder
function StopFlashTabs()
{
    this.super('div');

    this.tabs = []; // :Array<Builder>
}
// function addTab(Builder builder):@Chainable
StopFlashTabs.prototype.addTab = function(builder)
{
    this.tabs.push(new Builder('div')
        .className('tab')
        .css('left', (this.tabs.length * 300) +'px')
        .append(builder.className('tab-content'))
        .insert(this));

    return this;
};
// function setTab(int index):@Chainable
StopFlashTabs.prototype.setTab = function(index)
{
    this.css('left', '-'+ (index * 300) +'px')
        .css('height', Builder.getStyle(this.tabs[index], 'height'));

    return this;
};
fus.extend(StopFlashTabs, Builder);

// main
var main = function(rep)
{
    var ui = new StopFlashUI((rep != null)? rep.flashElements || [] : []);
        .insert(document.body);

    ui.content.setTab(0);
};

chrome.tabs.query({'highlighted': true, 'currentWindow': true}, function(tabs)
{
    chrome.tabs.sendMessage(tabs[0].id, {'getElements': 'stopflash'}, main);
});
