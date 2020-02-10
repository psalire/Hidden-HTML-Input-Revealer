
function generate_codes(settings) {
    /* Create UUIDs as variable/function/css names to inject */
    var css_input_uuid = uuidv4(),
        GLOBAL_orig_map_uuid = uuidv4(),
        css_info_window_uuid = uuidv4(),
        css_close_uuid = uuidv4(),
        css_instructions_uuid = uuidv4(),
        info_window_uuid = uuidv4(),
        info_window_title_uuid = uuidv4(),
        info_window_close_uuid = uuidv4(),
        info_window_instructions_uuid = uuidv4(),
        toggle_display_info_window_uuid = uuidv4(),
        on_click_uuid = uuidv4(),
        mutation_observer_uuid = uuidv4(),
        ftn_update_elem_uuid = uuidv4(),
        ftn_find_hidden_uuid = uuidv4(),
        ftn_find_hidden_iframe_helper_uuid = uuidv4(),
        ftn_make_visible_uuid = uuidv4();

    var mutation_code = `
        /* MutationObserver to find dynamically injected <input>s */
        let ${mutation_observer_uuid} = new MutationObserver(function(mutations) {
            for (let m of mutations) {
                if (m.type == 'childList') {
                    /* Check parent node */
                    if (m.target) {
                        if (m.target.nodeName == 'IFRAME') {
                            ${ftn_find_hidden_iframe_helper_uuid}(m.target);
                        }
                        else if (m.target.nodeName == 'INPUT') {
                            ${ftn_make_visible_uuid}(m.target, ${GLOBAL_orig_map_uuid}, null);
                        }
                    }
                    /* Check if children nodes added are input or iframe */
                    for (let e of m.addedNodes) {
                        /* Update inputs */
                        if (e.nodeName == 'INPUT') {
                            console.log(e);
                            ${ftn_make_visible_uuid}(e, ${GLOBAL_orig_map_uuid}, null);
                        }
                        /* Parse iframes */
                        else if (e.nodeName == 'IFRAME') {
                            console.log(e);
                            ${ftn_find_hidden_iframe_helper_uuid}(e);
                        }
                    }
                }
                /* Check altered inputs or iframes */
                else if (m.type == 'attributes') {
                    if (m.target.nodeName == 'IFRAME') {
                        ${ftn_find_hidden_iframe_helper_uuid}(m.target);
                    }
                    else if (m.target.nodeName == 'INPUT') {
                        ${ftn_make_visible_uuid}(m.target, ${GLOBAL_orig_map_uuid}, null);
                    }
                }
            }
        });
        ${mutation_observer_uuid}.observe(document.body, {childList: true, subtree: true, attributes: true});`,
        on_hover_window_code = `
            /* Display info window on mouseover */
            e.addEventListener('mouseover', function(ev) {
                let f = document.getElementById('${css_info_window_uuid}');
                /* Remove old info */
                while (f.firstChild) {
                    f.firstChild.remove();
                }
                /* Add new info */
                f.appendChild(${info_window_title_uuid});
                f.appendChild(document.createTextNode(map.get(e)));
                f.appendChild(document.createElement('div'));
                f.appendChild(${info_window_close_uuid});
                f.appendChild(${info_window_instructions_uuid});

                /* Display info window below input */
                let e_position = e.getBoundingClientRect(),
                    e_iframe_position = undefined;

                /* Display info window properly in iframes */
                if (e_iframe) {
                    e_iframe_position = e_iframe.getBoundingClientRect();
                }
                if (e_iframe_position) {
                    f.style.left = (e_position.left + e_iframe_position.left) + 'px';
                    f.style.top = (e_position.top + e_iframe_position.top + e.offsetHeight) + 'px';
                }
                else {
                    f.style.left = e_position.left + 'px';
                    f.style.top = (e_position.top + e.offsetHeight) + 'px';
                }
                f.style.display = 'initial';

                /* Add listener for ctrl key */
                document.addEventListener('keydown', ${toggle_display_info_window_uuid});
            });
            /* Hide info window on mouseout, unless CTRL was pressed */
            e.addEventListener('mouseout', function(ev) {
                if (!${on_click_uuid}) {
                    /* Hide info window */
                    document.getElementById('${css_info_window_uuid}').style.display = 'none';
                }
                /* Remove listener for ctrl key */
                document.removeEventListener('keydown', ${toggle_display_info_window_uuid});
            });
        `;

    return {
        input_css: `
            .${css_input_uuid} {
                background-color: ${settings.highlight_color};
            }
            #${css_info_window_uuid} {
                display: none;
                position: fixed;
                margin: auto;
                padding: 5px;
                min-width: 230px;
                max-width: 350px;
                background-color: ${settings.info_window_color};
                z-index: 2147483647;
                border: 4px solid black;
                border-radius: 5px;
                word-wrap: break-word;
                font-family: Calibri, sans-serif;
                font-size: 14px;
                color: ${settings.info_window_font_color};
                line-height: 1.3;
            }
            #${css_close_uuid}:hover {
                cursor: pointer;
                text-decoration: underline;
            }
            #${css_instructions_uuid} {
                position: absolute;
                right: 5px;
                bottom: 5px;
            }
        `,
        /* Show hidden inputs */
        show_hidden_inputs_js: `
            /* Create info window */
            let ${on_click_uuid} = false,
                ${info_window_title_uuid} = document.createElement('div'),
                ${info_window_close_uuid} = document.createElement('div'),
                ${info_window_instructions_uuid} = document.createElement('div'),
                ${info_window_uuid} = document.createElement('div');
            ${info_window_title_uuid}.innerHTML = '<u>Original element:</u>';
            ${info_window_close_uuid}.innerHTML = '<b style="font-weight: bold">Close</b>';

            /* Add info window to body */
            ${info_window_uuid}.id = '${css_info_window_uuid}'
            ${info_window_close_uuid}.id = '${css_close_uuid}'
            ${info_window_instructions_uuid}.innerHTML = '<i style="font-style: italic">Press CTRL to keep window open.</i>';
            ${info_window_instructions_uuid}.id = '${css_instructions_uuid}'
            document.body.appendChild(${info_window_uuid});

            /* Close button info window functionality */
            ${info_window_close_uuid}.onclick = function() {
                document.getElementById('${css_info_window_uuid}').style.display = 'none';
                ${on_click_uuid} = false;
            };
            /* Keep open info window functionality */
            function ${toggle_display_info_window_uuid}(ev) {
                if (ev.keyCode == 17) {
                    ${on_click_uuid} = !${on_click_uuid};
                }
            }

            /* Alter hidden <input>s to be visible and highlighted */
            function ${ftn_update_elem_uuid}(e, map, e_iframe) {
                e.style.backgroundColor = '${settings.highlight_color}';
                e.classList.add('${css_input_uuid}');
                
                /* Add on hover window code if enabled */
                ${settings['disable_hover_window'] ? '' : on_hover_window_code}
            }

            /* Make hidden /invisible element visible */
            function ${ftn_make_visible_uuid}(f, map, e_iframe) {
                let g = window.getComputedStyle(f);
                // console.log('reveal.js: '+g.getPropertyValue('display'));
                // console.log('reveal.js: '+g.getPropertyValue('visibility'));

                /* If type=inherited and parent not visible or hidden, make visible */
                if ((g.getPropertyValue('display') == 'inherited' ||
                      g.getPropertyValue('visibility') == 'inherited') &&
                      f.parentElement) {
                    let parent = window.getComputedStyle(f.parentElement);
                    if ((parent.getPropertyValue('display') == 'none'
                      || parent.getPropertyValue('visibility') == 'hidden')) {
                        if (!${GLOBAL_orig_map_uuid}.has(f)) {
                            ${GLOBAL_orig_map_uuid}.set(f, f.outerHTML);
                        }
                        if (!${GLOBAL_orig_map_uuid}.has(f.parentElement)) {
                            ${GLOBAL_orig_map_uuid}.set(f.parentElement, f.parentElement.outerHTML);
                        }

                        f.parentElement.removeAttribute('hidden');
                        f.parentElement.display = 'initial';
                        f.parentElement.classList.add('${css_input_uuid}');
                        f.parentElement.style.backgroundColor = 'rgb(0,255,0)';
                        f.display = 'initial';
                        f.removeAttribute('hidden');
                        ${ftn_update_elem_uuid}(f, map, e_iframe);
                    }
                }

                /* If input type=hidden, convert to text */
                if (f.type == 'hidden') {
                    if (!map.has(f)) {
                        map.set(f, f.outerHTML);
                    }
                    f.type = 'text';
                    ${ftn_update_elem_uuid}(f, map, e_iframe);
                }

                /* If input disabled, enable */
                if (f.disabled) {
                    if (!map.has(f)) {
                        map.set(f, f.outerHTML);
                    }
                    f.removeAttribute('disabled');
                    ${ftn_update_elem_uuid}(f, map, e_iframe);
                }

                /* If display=none, make initial */
                if (g.getPropertyValue('display') == 'none') {
                    if (!map.has(f)) {
                        map.set(f, f.outerHTML);
                    }
                    f.style.display = 'initial';
                    ${ftn_update_elem_uuid}(f, map, e_iframe);
                }

                /* If visibility=hidden, make initial */
                if (g.getPropertyValue('visibility') == 'hidden') {
                    if (!map.has(f)) {
                        map.set(f, f.outerHTML);
                    }
                    f.removeAttribute('hidden');
                    f.style.visibility = 'initial';
                    ${ftn_update_elem_uuid}(f, map, e_iframe);
                }
            }

            /* Remember pre-altered elements: {e: e.outerHTML} */
            var ${GLOBAL_orig_map_uuid} = new Map();

            /* Reveal hidden <input>s */
            function ${ftn_find_hidden_uuid}() {
                /* Find hidden <input>s and make visible */
                for (let f of document.getElementsByTagName('input')) {
                    ${ftn_make_visible_uuid}(f, ${GLOBAL_orig_map_uuid}, null);
                }

                /* Find hidden <input>s in <iframe>s and make visible */
                for (let f of document.getElementsByTagName('iframe')) {
                    ${ftn_find_hidden_iframe_helper_uuid}(f);
                }
            }

            /* Find hidden <input>s in <iframe>s and recursively in case of nested <iframe> */
            function ${ftn_find_hidden_iframe_helper_uuid}(f) {
                if (f && f.contentDocument) {
                    /* Show hidden inputs */
                    for (let g of f.contentDocument.body.getElementsByTagName('input')) {
                        ${ftn_make_visible_uuid}(g, ${GLOBAL_orig_map_uuid}, f);
                    }
                    /* Find nested <iframe>s */
                    for (let g of f.contentDocument.body.getElementsByTagName('iframe')) {
                        ${ftn_find_hidden_iframe_helper_uuid}(g);
                    }
                }
            }

            ${ftn_find_hidden_uuid}();
        
            /* Listen for dynamically added inputs if enabled */
            ${settings['disable_mutation_observer'] ? '' : mutation_code}
        `,
        /* Save function to reveal hidden inputs */
        ftn_find_hidden_uuid: ftn_find_hidden_uuid
    }
}
