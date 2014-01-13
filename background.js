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

    port.onDisconnect.addListener(function()
    {
        self.port = null;
    });
}

// class StopFlashBackground
function StopFlashBackground(id)
{
    this.id = id; // :int

    this.collectionId = 0; // :int

    this.collections = []; // :Array<BackgroundFlashCollection>
}
// function getCollection(int id):BackgroundFlashCollection
StopFlashBackground.prototype.getCollection = function(id)
{
    for(var i = 0; i < this.collections.length; ++i)
    {
        if(collections[i].id === id)
        {
            return collections[i];
        }
    }

    return null;
};
// function addContentScript(chrome.runtime.Port contentPort):void
StopFlashBackground.prototype.addContentScript = function(contentPort)
{
    var id = ++this.collectionId;

    this.collections.push(new BackgroundFlashCollection(id, contentPort));

    contentPort.postMessage({'stopflashWhitelist': whitelist, 'stopflashContentId': id});
};
// function sendToPopup():void
StopFlashBackground.prototype.sendToPopup = function()
{
    if(popupPort != null)
    {
        var data = [];

        for(var i = 0; i < this.collections.length; ++i)
        {
            Array.prototype.unshift.apply(data, this.collections[i].data);
        }

        popupPort.postMessage({'stopflashData': data});
    }
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
            this.collections[i].port.disconnect();
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
        if(backgrounds[i].id === id)
        {
            return backgrounds[i];
        }
    }

    return null;
};

// main
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
                    data = new StopFlashBackground(port.sender.tab.id);

                    backgrounds.push(data);
                }

                data.addContentScript(port);
            }

            if(rep['stopflashHaveChange'])
            {
                if(rep['stopflashIsMainFrame'])
                {
                    data.clear();
                }

                data.sendToContent({'stopflashDataUpdate': true});
            }

            if(rep['stopflashDataUpdate'] && rep['stopflashData'])
            {
                data.setData(rep.stopflashData);
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
                data = getFlashData(rep['stopflashInit']);

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

            if(rep['stopflashBlock'])
            {

                data.sendToContent({'stopflashBlock': rep['stopflashBlock']});
            }

            if(rep['stopflashUnblock'])
            {
                data.sendToContent({'stopflashUnblock': rep['stopflashUnblock']});
            }
        });
    }
});
