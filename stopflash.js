/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * stopflash.js
 */

// class StopFlashPopup
function StopFlashPopup(doc)
{
    this.ui = new StopFlashUI(this)
            .insert(doc.body);

    this.port = null; // :chrome.runtime.Port

    var self = this;

    chrome.tabs.query({'highlighted': true, 'currentWindow': true}, function(tabs)
    {
        self.port = chrome.runtime.connect({'name': 'stopflashPopup'});

        self.port.onMessage.addListener(function(rep)
        {
            if(rep['stopflashData'])
            {
                self.ui.setElements(rep['stopflashData']);
            }
        });

        self.port.postMessage({'stopflashInit': tabs[0].id});
    });
}

// class StopFlashUI extends Builder
function StopFlashUI(popup)
{
    this.super('div');

    this.popup = popup;

    this.mainTab = new Builder('div');

    this.content = new StopFlashTabs()
        .className('content')
        .addTab(this.mainTab)
        .addTab(new Builder('div')
            .text('Whitelist tab'))
        .addTab(new Builder('div')
            .text('Options tab'))
        .setTab(0);

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

    this.setElements(null);
}
// function setElements(Array<Object> elements):void
StopFlashUI.prototype.setElements = function(elements)
{
    this.mainTab.clear();

    if(elements != null && elements.length > 0)
    {
        var self = this;

        this.mainTab.append(new Builder('p')
            .text(elements.length + ((elements.length > 1)? ' elements trouvés' : ' element trouvé')))

        for(var i = 0; i < elements.length; ++i)
        {
            this.mainTab.append(new StopFlashElement(this.popup, elements[i]));
        }
    }
    else
    {
        this.mainTab.append(new Builder('p').text('Aucun element trouvé sur cette page'));
    }
};
fus.extend(StopFlashUI, Builder);

// class StopFlashElement extends Builder
function StopFlashElement(popup, data)
{
    this.super('div');

    this.popup = popup; // :StopFlashPopup
    this.data = data; // :Object

    var self = this;

    this.className('flash-element')
        .append(new Builder('p')
            .className('flash-url')
            .set('title', this.data.url)
            .text(this.data.url))
        .append(new Builder('span')
            .className('flash-type')
            .text(this.data.type))
        .append(new Builder('div')
            .className('flash-menu')
            .append(new Builder('a')
                .text(this.data.blocked? 'Débloquer' : 'Bloquer')
                .event('click', function()
                {
                    if(self.data.blocked)
                    {
                        self.popup.port.postMessage({'stopflashUnblock': self.data});
                    }
                    else
                    {
                        self.popup.port.postMessage({'stopflashBlock': self.data});
                    }
                }))
            .append(new Builder('a')
                .text(this.data.whitelist? '- Whitelist' : '+ Whitelist')
                .event('click', function()
                {
                    //
                })));
}
fus.extend(StopFlashElement, Builder);

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
var popup = new StopFlashPopup(document);
