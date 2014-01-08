/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * background.js
 */

var flashElements = {}; // :Map<chrome.Tab, Object>

chrome.runtime.onConnect.addListener(function(port)
{
    port.onMessage.addListener(function(rep)
    {
        if(rep['stopflashDataUpdate'] && rep['stopflashData'])
        {
            flashElements[port.sender.tab] = rep.stopflashData;

            port.postMessage({succes: true});
        }
        else if(rep['stopflashGetData'])
        {
            port.postMessage({'stopflashDataSend': true, 'stopflashData': flashElements[port.sender.tab]});
        }
    });
});
