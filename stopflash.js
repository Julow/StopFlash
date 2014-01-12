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
        .addTab(this.mainTab)
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
// function setElements(Array<Object> elements):void
StopFlashUI.prototype.setElements = function(elements)
{
    this.mainTab.clear();

    if(elements != null && elements.length > 0)
    {
        for(var i = 0, e; i < elements.length; ++i)
        {
            e = elements[i];

            this.mainTab.append(new Builder('div')
                .className('flash-element')
                .append(new Builder('div')
                    .className('flash-menu')
                    .append(new Builder('a')
                        .text(e.blocked? 'Débloquer' : 'Bloquer'))
                    .append(new Builder('a')
                        .text(e.whitelist? '- Whitelist' : '+ Whitelist')))
                .append(new Builder('p')
                    .className('flash-url')
                    .text(e.url))
                .append(new Builder('span')
                    .className('flash-type')
                    .text(e.type)));
        }
    }
    else
    {
        this.mainTab.append(new Builder('p').text('Aucun element trouvé sur cette page'));
    }
};
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
    for(var i = 0; i < this.tabs.length; ++i)
    {
        if(index === i)
        {
            this.tabs[i].css('position', 'relative')
                    .css('opacity', '1');
        }
        else
        {
            this.tabs[i].css('position', '')
                    .css('opacity', '0.3');
        }
    }

    this.css('left', '-'+ (index * 300) +'px');

    return this;
};
fus.extend(StopFlashTabs, Builder);

// main
var ui = new StopFlashUI()
    .insert(document.body);

ui.content.setTab(0);

ui.setElements(null);

chrome.tabs.query({'highlighted': true, 'currentWindow': true}, function(tabs)
{
    var port = chrome.runtime.connect({'name': 'stopflashPopup'});

    port.onMessage.addListener(function(rep)
    {
        if(rep['stopflashData'])
        {
            ui.setElements(rep['stopflashData']);
        }
    });

    port.postMessage({'stopflashInit': tabs[0].id});
});
