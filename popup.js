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
    this.port = null; // :chrome.runtime.Port

    this.whitelist = []; // :Array<String>
    this.isWhitelist = false; // :boolean

    this.ui = new StopFlashUI(this)
            .insert(doc.body);

    var self = this;

    chrome.tabs.query({'highlighted': true, 'currentWindow': true}, function(tabs)
    {
        self.port = chrome.runtime.connect({'name': 'stopflashPopup'});

        self.port.onMessage.addListener(function(rep)
        {
            if(rep['stopflashData'])
            {
                self.whitelist = rep['stopflashWhitelist'];
                self.isWhitelist = rep['stopflashIsWhitelist'];

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
    this.whitelistTab = new Builder('div');

    this.content = new StopFlashTabs()
        .className('content')
        .addTab(this.mainTab)
        .addTab(this.whitelistTab)
        .setTab(0);

    var self = this;

    this.whitelist = new Builder('a')
        .className('whitelist')
        .event('click', function()
        {
            self.popup.port.postMessage({'stopflashSetWhitelist': !self.popup.isWhitelist});
        });

    this.append(new Builder('div')
            .className('head')
            .append(new Builder('p')
                .className('logo')
                .html('<b>ST<img src="icons/stopflash_16.png" />P</b> <span>Flash</span>'))
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
                })))
        .append(this.content)
        .append(new Builder('div')
            .className('foot')
            .html('Créé par <a href="https://github.com/JWhile/StopFlash" target="_blank">juloo</a> - v0.1.3'));

    this.setElements(null);
}
// function setElements(Array<Object> elements):void
StopFlashUI.prototype.setElements = function(elements)
{
    var elementsCount = new Builder('p');

    this.mainTab.clear()
        .append(this.whitelist
            .text(this.popup.isWhitelist? '- Whitelist' : '+ Whitelist')
            .set('title', this.popup.isWhitelist? 'Retirer cette page de la whitelist' : 'Ajouter cette page a la whitelist'))
        .append(elementsCount);

    if(elements != null && elements.length > 0)
    {
        var self = this;

        elementsCount.text(elements.length + ((elements.length > 1)? ' elements trouvés' : ' element trouvé'));

        for(var i = 0; i < elements.length; ++i)
        {
            this.mainTab.append(new StopFlashElement(this.popup, elements[i]));
        }
    }
    else
    {
        elementsCount.text('Aucun element trouvé');
    }

    this.whitelistTab.clear()
        .append(new Builder('p')
            .text((this.popup.whitelist.length > 0)? this.popup.whitelist.length +' element'+ ((this.popup.whitelist.length > 1)? 's' : '') +' dans la whitelist' : 'La whitelist est vide'));

    for(var i = 0; i < this.popup.whitelist.length; ++i)
    {
        this.whitelistTab.append(new StopFlashWhitelistElement(this.popup, this.popup.whitelist[i]));
    }
};
fus.extend(StopFlashUI, Builder);

// class StopFlashWhitelistElement extends Builder
function StopFlashWhitelistElement(popup, dataUrl)
{
    this.super('div');

    this.popup = popup; // :StopFlashpopup
    this.dataUrl = dataUrl; // :String

    this.url = new Builder('p'); // :Builder
    this.expend = false; // :boolean

    var self = this;

    this.className('flash-element')
        .append(this.url
            .className('flash-url')
            .set('title', this.dataUrl)
            .text(this.dataUrl)
            .event('click', function()
            {
                if(self.expend)
                {
                    self.url.className('flash-url');
                }
                else
                {
                    self.url.className('flash-url expend');

                    selectText(self.url.node);
                }

                self.expend = !self.expend;
            }))
        .append(new Builder('span')
            .className('flash-type')
            .text('Page'))
        .append(new Builder('div')
            .className('flash-menu')
            .append(new Builder('a')
                .text('- Whitelist')
                .event('click', function()
                {
                    self.popup.port.postMessage({'stopflashSetWhitelist': !self.popup.isWhitelist});
                })));
}
fus.extend(StopFlashWhitelistElement, Builder);

// class StopFlashElement extends Builder
function StopFlashElement(popup, data)
{
    this.super('div');

    this.popup = popup; // :StopFlashPopup
    this.data = data; // :Object

    this.url = new Builder('p'); // :Builder
    this.expend = false; // :boolean

    var self = this;

    this.className('flash-element')
        .append(this.url
            .className('flash-url')
            .set('title', this.data.url)
            .text(this.data.url)
            .event('click', function()
            {
                if(self.expend)
                {
                    self.url.className('flash-url');
                }
                else
                {
                    self.url.className('flash-url expend');

                    selectText(self.url.node);
                }

                self.expend = !self.expend;
            }))
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
            .append(new Builder('span')
                .text(this.data.whitelist? '- Whitelist' : '+ Whitelist')));
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
