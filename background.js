/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * background.js
 */

function BackgroundFlashData(id)
{
    this.id = id; // :int

    this.data = null; // :Object

    this.popupPort = null; // :chrome.runtime.Port
}
// function setData(Object data):void
BackgroundFlashData.prototype.setData = function(data)
{
    this.data = data;

    this.sendToPopup();
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
// function sendToPopup():void
BackgroundFlashData.prototype.sendToPopup = function()
{
    if(this.popupPort != null)
    {
        this.popupPort.postMessage({'stopflashData': this.data});
    }
};
// function clear():void
BackgroundFlashData.prototype.clear = function()
{
    this.data = null;

    this.popupPort.disconnect();
    this.popupPort = null;
};

var flashData = []; // :Array<BackgroundFlashData>

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
    if(port.name === 'stopflashContentScript')
    {
        var data = null;

        port.onMessage.addListener(function(rep)
        {
            if(rep['stopflashInit'])
            {
                data = getFlashData(port.sender.tab.id);

                if(data != null)
                {
                    data.clear();
                }
                else
                {
                    data = new BackgroundFlashData(port.sender.tab.id);

                    flashData.push(data);
                }
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
                //
            }

            if(rep['stopflashUnblock'])
            {
                //
            }
        });
    }
});
