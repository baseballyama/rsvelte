import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-111o1wz">Hello</p>`);

const $$css = { hash: 'svelte-111o1wz', code: 'p.svelte-111o1wz {color : red;--gap: ;content:" x ";}' };

export default function Options_custom_css_prune($$anchor) {
	$.append_styles($$anchor, $$css);
	var p = root();
	$.append($$anchor, p);
}

customElements.define('my-element', $.create_custom_element(Options_custom_css_prune, {}, [], [], { mode: 'open' }));
