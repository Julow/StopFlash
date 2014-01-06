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
}
fus.extend(StopFlashUI, Builder);

// main
var main = function(elements)
{
    new StopFlashUI()
        .insert(document.body);
};

chrome.tabs.query({'highlighted': true, 'currentWindow': true}, function(tabs)
{
    chrome.tabs.sendMessage(tabs[0].id, {'getElements': 'stopflash'}, main);
});
