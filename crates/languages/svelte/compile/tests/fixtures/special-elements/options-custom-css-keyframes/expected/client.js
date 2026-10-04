import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-11upod0">Hello</p>`);

const $$css = { hash: 'svelte-11upod0', code: '\n@keyframes svelte-11upod0-wiggle { from { opacity: 0 } to { opacity: 1 } }p.svelte-11upod0 { animation: svelte-11upod0-wiggle 1s;color:red}' };

export default function Options_custom_css_keyframes($$anchor) {
	$.append_styles($$anchor, $$css);
	var p = root();
	$.append($$anchor, p);
}

customElements.define('my-element', $.create_custom_element(Options_custom_css_keyframes, {}, [], [], { mode: 'open' }));
