
/* Settings values */
var settings = {
    is_on: true,
    disable_hover_window: false,
    disable_automatic_mutation_observer: false,
    enable_manual_mutation_observer: false,
    highlight_color: 'rgba(0,255,0,1)',
    info_window_color: 'rgba(0,255,0,0.8)',
    info_window_font_color: 'rgba(0,0,0,1)',
};

/* {tab_id: ftn_find_hidden_uuid}*/
var ACTIVE_TABS = new Map();

chrome.runtime.onStartup.addListener(function() {
    ACTIVE_TABS.clear();
    chrome.storage.sync.get(['is_on', 'highlight_color', 'info_window_color',
                             'info_window_font_color', 'disable_hover_window',
                             'disable_automatic_mutation_observer',
                             'enable_manual_mutation_observer'], function(res) {
        for (let key in res) {
            settings[key] = res[key];
        }
    });
});
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set(settings);
});
chrome.storage.onChanged.addListener(function(changes, s) {
    for (let key in changes) {
        settings[key] = changes[key].newValue;
    }
    console.log(settings);
});

function reveal_hidden_inputs(codes, tab_id) {
    /* If tab has injected scripts, call reveal function */
    let ftn_find_hidden_uuid;
    if ((ftn_find_hidden_uuid = ACTIVE_TABS.get(tab_id))) {
        chrome.tabs.executeScript(tab_id, {code: `${ftn_find_hidden_uuid}();}`});
    }
    /* If not yet injected, inject reveal scripts and save reveal function to map */
    else {
        chrome.tabs.insertCSS(tab_id, {code: codes.input_css}, function() {
            chrome.tabs.executeScript(tab_id, {code: codes.show_hidden_inputs_js});
        });
        ACTIVE_TABS.set(tab_id, codes['ftn_find_hidden_uuid']);
    }
}

chrome.tabs.onUpdated.addListener(function(tab_id, change_info, tab) {
    // console.log(settings['is_on']);
    ACTIVE_TABS.delete(tab_id);
    if (!settings['is_on'] || /(^chrome((-extension)|(-error))?:\/\/)|(.pdf(#.*)?)$/.test(tab.url)) {
        return;
    }
    console.log('EVENT: tab.updated');
    if (change_info == 'complete' || tab && tab.status == 'complete') {
        /* Show hidden inputs */
        let automatic_settings = settings;
        automatic_settings['disable_mutation_observer'] = settings['disable_automatic_mutation_observer']
        reveal_hidden_inputs(generate_codes(automatic_settings), tab_id);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, response) {
    /* console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension"); */
    if (request.msg == 'MANUAL_REVEAL') {
        /* Assume manual_reveal comes from active tab */
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
            console.log(tabs);
            if (!/(^chrome((-extension)|(-error))?:\/\/)|(.pdf(#.*)?)$/.test(tabs[0].url)) {
                let tab_id = tabs[0].id,
                    manual_settings = settings;
                manual_settings['disable_mutation_observer'] = !settings['enable_manual_mutation_observer'];
                reveal_hidden_inputs(ACTIVE_TABS.get(tab_id) ? undefined : generate_codes(manual_settings), tab_id);
            }
        });
    }
});
