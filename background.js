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
};

// class StopFlashBackground
function StopFlashBackground(id)
{
    this.id = id; // :int

    this.collectionId = 0; // :int

    this.collections = []; // :Array<BackgroundFlashCollection>

    this.popupPort = null; // :chrome.runtime.Port
}
// function setData(Object data):void
StopFlashBackground.prototype.setData = function(data)
{
    if(data.length > 0)
    {
        Array.prototype.unshift.apply(this.data, data);

        this.sendToPopup();
    }
};
// function setPopup(chrome.runtime.Port popupPort):void
StopFlashBackground.prototype.setPopup = function(popupPort)
{
    this.popupPort = popupPort;

    var self = this;

    this.popupPort.onDisconnect.addListener(function()
    {
        self.popupPort = null;
    });

    this.sendToPopup();
};
// function setContentScript(chrome.runtime.Port contentPort):void
StopFlashBackground.prototype.setContentScript = function(contentPort)
{
    this.collections.push(new BackgroundFlashCollection(++this.collectionId, contentPort));

    contentPort.postMessage({'stopflashWhitelist': whitelist, 'stopflashContentId': 0});
};
// function sendToPopup():void
StopFlashBackground.prototype.sendToPopup = function()
{
    if(this.popupPort != null)
    {
        var data = [];

        for(var i = 0; i < this.collections.length; ++i)
        {
            Array.prototype.unshift.apply(data, this.collections[i].data);
        }

        this.popupPort.postMessage({'stopflashData': data});
    }
};
// function sendToContent(Object data):void
StopFlashBackground.prototype.sendToContent = function(data)
{
    for(var i = 0; i < this.collections.length; ++i)
    {
        this.collections[i].port.postMessage(data);
    }
};
// function clear():void
StopFlashBackground.prototype.clear = function()
{
    if(this.popupPort != null)
    {
        this.popupPort.disconnect();
    }

    this.popupPort = null;

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

                data.setContentScript(port);
            }

            if(rep['stopflashHaveChange'])
            {
                if(rep['stopflashIsMainFrame'])
                {
                    data.data = [];
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
                    data.setPopup(port);
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
