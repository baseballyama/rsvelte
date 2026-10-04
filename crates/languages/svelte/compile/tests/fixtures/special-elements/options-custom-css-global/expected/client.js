import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-12ljp4">Hello</p>`);

const $$css = { hash: 'svelte-12ljp4', code: 'body {color:red}\n@media (width > 10px) {p.svelte-12ljp4 {color:blue} }' };

export default function Options_custom_css_global($$anchor) {
	$.append_styles($$anchor, $$css);
	var p = root();
	$.append($$anchor, p);
}

customElements.define('my-element', $.create_custom_element(Options_custom_css_global, {}, [], [], { mode: 'open' }));
