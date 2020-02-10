
/* Regex to match and extract rgba string numbers */
var rgba_regex = /^rgba\(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-5][0-5]),([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-5][0-5]),([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-5][0-5]),([0-1]|0\.[0-9][0-9]?|1\.0)\)$/;

function get_color_values_from_form(id_name) {
    var ret = 'rgba(';
    ret += document.getElementById(id_name+'_r').value + ',';
    ret += document.getElementById(id_name+'_g').value + ',';
    ret += document.getElementById(id_name+'_b').value + ',';
    ret += document.getElementById(id_name+'_a').value + ')';
    return ret;
}
function get_color_values_from_string(str) {
    var regex_match = str.match(rgba_regex),
        ret_obj = {};
    if (!regex_match || regex_match.length < 5) {
        return ret_obj;
    }
    ret_obj['r'] = regex_match[1];
    ret_obj['g'] = regex_match[2];
    ret_obj['b'] = regex_match[3];
    ret_obj['a'] = regex_match[4];
    return ret_obj;
}
function fill_initial_color_values(id_name, obj, defaults) {
    document.getElementById(id_name+'_r').value = obj && obj.r ? obj.r : defaults[0];
    document.getElementById(id_name+'_g').value = obj && obj.g ? obj.g : defaults[1];
    document.getElementById(id_name+'_b').value = obj && obj.b ? obj.b : defaults[2];
    document.getElementById(id_name+'_a').value = obj && obj.a ? obj.a : defaults[3];
}

window.onload = function() {
    /* Fill form with current values */
    chrome.storage.sync.get(['highlight_color', 'info_window_color', 'info_window_font_color',
                             'disable_hover_window', 'disable_mutation_observer'], function(res) {
        var highlight_color_obj = get_color_values_from_string(res.highlight_color),
            info_window_color_obj = get_color_values_from_string(res.info_window_color),
            info_window_font_color_obj = get_color_values_from_string(res.info_window_font_color);
        fill_initial_color_values('highlight_color', highlight_color_obj, [0,255,0,1]);
        fill_initial_color_values('info_window_color', info_window_color_obj, [0,255,0,0.8]);
        fill_initial_color_values('info_window_font_color', info_window_font_color_obj, [0,0,0,1]);
        if (res.disable_hover_window) {
            document.getElementById('disable_info_window').click();
        }
        if (res.disable_mutation_observer) {
            document.getElementById('dynamic_parse').click();
        }
    });

    /* Clicking subtitle also clicks checkbox */
    document.getElementById('disable_info_subtitle').addEventListener('click', function(e) {
        document.getElementById('disable_info_window').click();
    });
    document.getElementById('dynamic_parse_subtitle').addEventListener('click', function(e) {
        document.getElementById('dynamic_parse').click();
    });
    document.getElementById('manual_dynamic_parse_subtitle').addEventListener('click', function(e) {
        document.getElementById('manual_dynamic_parse').click();
    });

    /* Submit buttons handlers */
    document.getElementById('submit_advanced_settings').addEventListener('click', function(e) {
        chrome.storage.sync.set({
            disable_hover_window: document.getElementById('disable_info_window').checked,
            disable_automatic_mutation_observer: document.getElementById('dynamic_parse').checked,
            enable_manual_mutation_observer: document.getElementById('manual_dynamic_parse').checked
        }, function() {
            var success_msg = document.getElementById('submit_advanced_settings_success');
            success_msg.style.display = 'block';
            setTimeout(function() {
                success_msg.style.display = 'none';
            }, 3000);
        });
    });
    document.getElementById('submit_color').addEventListener('click', function(e) {
        var highlight_color_str = get_color_values_from_form('highlight_color'),
            info_window_color_str = get_color_values_from_form('info_window_color'),
            info_font_color_str = get_color_values_from_form('info_window_font_color');


        var highlight_color_regex_match = highlight_color_str.match(rgba_regex),
            info_window_color_regex_match = info_window_color_str.match(rgba_regex),
            info_font_color_regex_match = info_font_color_str.match(rgba_regex);

        if (!highlight_color_regex_match || !info_window_color_regex_match || !info_font_color_regex_match) {
            var error_msg = document.getElementById('color_submit_error'),
                success_msg = document.getElementById('color_submit_success');
            error_msg.style.display = 'block';
            success_msg.style.display = 'none';
        }
        else {
            chrome.storage.sync.set({
                highlight_color: highlight_color_str,
                info_window_color: info_window_color_str,
                info_window_font_color: info_font_color_str
            }, function() {
                var error_msg = document.getElementById('color_submit_error'),
                    success_msg = document.getElementById('color_submit_success');
                error_msg.style.display = 'none';
                success_msg.style.display = 'block';
                setTimeout(function() {
                    success_msg.style.display = 'none';
                }, 3000);
            });
        }
    });
};
