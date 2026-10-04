import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Options_custom_host($$anchor, $$props) {
	let host = $$props.$$host;
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, host));
	$.append($$anchor, p);
}

customElements.define('my-element', $.create_custom_element(Options_custom_host, {}, [], [], { mode: 'open' }));
