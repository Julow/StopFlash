/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * background.js
 */

// class BackgroundFlashCollection(id)
function BackgroundFlashCollection(id)
{
    this.id = id;
};

// class BackgroundFlashData
function BackgroundFlashData(id)
{
    this.id = id; // :int

    this.data = []; // :Array<Object>

    this.popupPort = null; // :chrome.runtime.Port
    this.contentPorts = []; // :Array<chrome.runtime.Port>
}
// function setData(Object data):void
BackgroundFlashData.prototype.setData = function(data)
{
    if(data.length > 0)
    {
        Array.prototype.unshift.apply(this.data, data);

        this.sendToPopup();
    }
};
// function setPopup(chrome.runtime.Port popupPort):void
BackgroundFlashData.prototype.setPopup = function(popupPort)
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
BackgroundFlashData.prototype.setContentScript = function(contentPort)
{
    this.contentPorts.push(contentPort);

    var self = this;

    contentPort.onDisconnect.addListener(function()
    {
        var index = self.contentPorts.indexOf(contentPort);

        if(index >= 0)
        {
            self.contentPorts.splice(index, 1);
        }
    });

    contentPort.postMessage({'stopflashWhitelist': whitelist, 'stopflashContentId': 0});
};
// function sendToPopup():void
BackgroundFlashData.prototype.sendToPopup = function()
{
    if(this.popupPort != null)
    {
        this.popupPort.postMessage({'stopflashData': this.data});
    }
};
// function sendToContent(Object data):void
BackgroundFlashData.prototype.sendToContent = function(data)
{
    for(var i = 0; i < this.contentPorts.length; ++i)
    {
        this.contentPorts[i].postMessage(data);
    }
};
// function clear():void
BackgroundFlashData.prototype.clear = function()
{
    this.data = null;

    if(this.popupPort != null)
    {
        this.popupPort.disconnect();
    }

    this.popupPort = null;

    if(this.contentPorts.length > 0)
    {
        for(var i = 0; i < this.contentPorts.length; ++i)
        {
            this.contentPorts[i].disconnect();
        }
    }

    this.contentPort = [];
};

var flashData = []; // :Array<BackgroundFlashData>
var whitelist = []; // :Array<String>
var collectionId = 0; // :int

// function getFlashData(int id):BackgroundFlashData
var getFlashData = function(id)
{
    for(var i = 0; i < flashData.length; ++i)
    {
        if(flashData[i].id === id)
        {
            return flashData[i];
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
                data = getFlashData(port.sender.tab.id);

                if(data != null)
                {
                    if(rep['stopflashIsMainFrame'])
                    {
                        data.clear();
                    }
                }
                else
                {
                    data = new BackgroundFlashData(port.sender.tab.id);

                    flashData.push(data);
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
