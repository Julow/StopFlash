/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * background.js
 */

// class BackgroundFlashCollection
function BackgroundFlashCollection(background, id, port)
{
    this.background = background; // :StopFlashBackground

    this.id = id; // :int

    this.data = []; // :Array<Object>

    this.port = port; // :chrome.runtime.Port

    var self = this;

    port.onMessage.addListener(function(msg)
    {
        if(msg['stopflashDataUpdate'] && msg['stopflashData'])
        {
            self.data = msg.stopflashData;

            self.background.sendToPopup();
        }
    });

    port.onDisconnect.addListener(function()
    {
        self.port = null;
    });
}

// class StopFlashBackground
function StopFlashBackground(tab)
{
    this.tab = tab; // :int

    this.collectionId = 0; // :int

    this.collections = []; // :Array<BackgroundFlashCollection>
}
// function getCollection(int id):BackgroundFlashCollection
StopFlashBackground.prototype.getCollection = function(id)
{
    for(var i = 0; i < this.collections.length; ++i)
    {
        if(this.collections[i].id === id)
        {
            return this.collections[i];
        }
    }

    return null;
};
// function addContentScript(chrome.runtime.Port contentPort):void
StopFlashBackground.prototype.addContentScript = function(contentPort)
{
    var id = ++this.collectionId;

    this.collections.push(new BackgroundFlashCollection(this, id, contentPort));

    contentPort.postMessage({'stopflashWhitelist': whitelist, 'stopflashIsWhitelist': isWhitelist(this.tab.url), 'stopflashCollectionId': id});
};
// function getData():Array<Object>
StopFlashBackground.prototype.getData = function()
{
    var data = [];

    for(var i = 0; i < this.collections.length; ++i)
    {
        Array.prototype.unshift.apply(data, this.collections[i].data);
    }

    return data;
};
// function sendToPopup():void
StopFlashBackground.prototype.sendToPopup = function()
{
    var data = this.getData();

    if(popupPort != null)
    {
        popupPort.postMessage({'stopflashData': data, 'stopflashIsWhitelist': isWhitelist(this.tab.url), 'stopflashWhitelist': whitelist});
    }

    chrome.browserAction.setBadgeText({
      'text': (data.length > 0)? ''+ data.length : '',
      'tabId': this.tab.id
    });
};
// function sendToContent(Object msg):void
StopFlashBackground.prototype.sendToContent = function(msg)
{
    for(var i = 0; i < this.collections.length; ++i)
    {
        this.collections[i].port.postMessage(msg);
    }
};
// function clear():void
StopFlashBackground.prototype.clear = function()
{
    if(this.collections.length > 0)
    {
        for(var i = 0; i < this.collections.length; ++i)
        {
            if(this.collections[i].port != null)
            {
                this.collections[i].port.disconnect();
            }
        }
    }

    this.collections = [];
};

var backgrounds = []; // :Array<StopFlashBackground>
var whitelist = []; // :Array<String>
var popupPort = null; // :chrome.runtime.Port

// function getBackground(int id):StopFlashBackground
var getBackground = function(id)
{
    for(var i = 0; i < backgrounds.length; ++i)
    {
        if(backgrounds[i].tab.id === id)
        {
            return backgrounds[i];
        }
    }

    return null;
};

// function isWhitelist(String url):boolean
var isWhitelist = function(url)
{
    for(var i = 0; i < whitelist.length; ++i)
    {
        if(url.indexOf(whitelist[i]) >= 0)
        {
            return true;
        }
    }

    return false;
};

// main
var main = function()
{
    var w = localStorage.getItem('stopflashWhitelist');
    whitelist = (w == null && w.length > 0)? [] : w.split(';');

    chrome.runtime.onConnect.addListener(function(port)
    {
        if(port.name === 'stopflashContentScript' && port.sender.tab != null)
        {
            var data = null;

            port.onMessage.addListener(function(rep)
            {
                if(rep['stopflashInit'])
                {
                    data = getBackground(port.sender.tab.id);

                    if(data != null)
                    {
                        if(rep['stopflashIsMainFrame'])
                        {
                            data.clear();
                        }
                    }
                    else
                    {
                        data = new StopFlashBackground(port.sender.tab);

                        backgrounds.push(data);
                    }

                    data.addContentScript(port);
                }
            });
        }
        else if(port.name === 'stopflashPopup')
        {
            var data = null;

            port.onMessage.addListener(function(rep)
            {
                if(rep['stopflashInit'])
                {
                    data = getBackground(rep['stopflashInit']);

                    if(data != null)
                    {
                        popupPort = port;

                        port.onDisconnect.addListener(function()
                        {
                            popupPort = null;
                        });

                        data.sendToPopup();
                    }
                }

                if(typeof rep['stopflashSetWhitelist'] === 'boolean')
                {
                    if(rep['stopflashSetWhitelist'])
                    {
                        var url = new Url(data.tab.url).parse();

                        whitelist.push(url.getHost());
                    }
                    else
                    {
                        for(var i = 0; i < whitelist.length; ++i)
                        {
                            if(data.tab.url.indexOf(whitelist[i]) >= 0)
                            {
                                whitelist.splice(i, 1);

                                --i;
                            }
                        }
                    }

                    localStorage.setItem('stopflashWhitelist', whitelist.join(';'));

                    data.sendToPopup();
                }

                if(rep['stopflashBlock'])
                {
                    var collection = data.getCollection(rep['stopflashBlock'].collection);

                    if(collection != null)
                    {
                        collection.port.postMessage(rep);
                    }
                }

                if(rep['stopflashUnblock'])
                {
                    var collection = data.getCollection(rep['stopflashUnblock'].collection);

                    if(collection != null)
                    {
                        collection.port.postMessage(rep);
                    }
                }
            });
        }
    });
};

main();
