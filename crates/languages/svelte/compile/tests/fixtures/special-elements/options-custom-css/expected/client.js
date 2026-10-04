import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-22ksm8">Hello</p>`);

const $$css = { hash: 'svelte-22ksm8', code: 'p.svelte-22ksm8 {color:red}' };

export default function Options_custom_css($$anchor) {
	$.append_styles($$anchor, $$css);
	var p = root();
	$.append($$anchor, p);
}

customElements.define('my-element', $.create_custom_element(Options_custom_css, {}, [], [], { mode: 'open' }));
