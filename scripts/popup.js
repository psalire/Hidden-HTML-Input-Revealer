
var GLOBAL_refresh_info_visible = false;

function toggle_refresh_info() {
    GLOBAL_refresh_info_visible = !GLOBAL_refresh_info_visible;
    document.getElementById('refresh_info').style.display = GLOBAL_refresh_info_visible ? 'block' : 'none';
}

window.onload = function() {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
        var this_tab = tabs[0],
            on_switch = document.getElementById('on_switch');

        /* Load on/off value */
        chrome.storage.sync.get(['is_on'], function(c, str) {
            var onoff_text = document.getElementById('onoff_text');
            console.log(c);
            on_switch.checked = c.is_on;
            onoff_text.innerText = c.is_on ? 'ON' : 'OFF';
            /* Save on/off value onclick */
            on_switch.addEventListener('click', function(e) {
                chrome.storage.sync.set({'is_on': on_switch.checked});
                onoff_text.innerText = onoff_text.innerText == 'ON' ? 'OFF' : 'ON';
                toggle_refresh_info();
            });
        });
        
        document.getElementById('manual_button').addEventListener('click', function(e) {
            chrome.runtime.sendMessage({msg: 'MANUAL_REVEAL'});
        });
        document.getElementById('options_link').addEventListener('click', function(e) {
            chrome.runtime.openOptionsPage();
        });
        document.getElementById('refresh_link').addEventListener('click', function(e) {
            console.log(this_tab);
            chrome.tabs.reload(this_tab.id, function() {
                toggle_refresh_info();
            });
        });
    });
    
    
};
