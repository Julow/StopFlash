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

var flashData = []; // :Array<BackgroundFlashData>

chrome.runtime.onConnect.addListener(function(port)
{
    if(port.name === 'stopflashContentScript')
    {
        var data = null;

        port.onMessage.addListener(function(rep)
        {
            if(rep['stopflashInit'])
            {
                data = new BackgroundFlashData(rep['stopflashInit']);
            }

            if(rep['stopflashDataUpdate'] && rep['stopflashData'])
            {
                data.setData(rep.stopflashData);
            }
        });
    }
    else if(port.name === 'stopflashPopup')
    {
        port.onMessage.addListener(function(rep)
        {
            if(rep['stopflashInit'])
            {
                for(var i = 0, d; i < flashData.length; ++i)
                {
                    d = flashData[i];

                    if(d.id === rep['stopflashInit'])
                    {
                        d.setPopup(port);

                        break;
                    }
                }
            }
        });
    }
});
