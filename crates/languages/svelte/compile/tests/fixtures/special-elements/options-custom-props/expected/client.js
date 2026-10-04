import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Options_custom_props($$anchor, $$props) {
	$.push($$props, true);
	let value = $.prop($$props, 'value', 7, true);
	var $$exports = { get value() {
		return value();
	}, set value($$value = true) {
		value($$value);
		$.flush();
	} };
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, value()));
	$.append($$anchor, p);
	return $.pop($$exports);
}

customElements.define('my-element', $.create_custom_element(Options_custom_props, { value: {} }, [], [], { mode: 'open' }));
