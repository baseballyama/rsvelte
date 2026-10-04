import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', '$$host', 'value']);

var root = $.from_html(`<p> </p>`);

export default function Options_custom_rest_access($$anchor, $$props) {
	$.push($$props, true);
	let value = $.prop($$props, 'value', 7), rest = $.rest_props($$props, rest_excludes);
	function change() {
		rest.other = 1;
		rest.count++;
		let x;
		x = rest.other;
		return $$props.other;
	}
	var $$exports = { get value() {
		return value();
	}, set value($$value) {
		value($$value);
		$.flush();
	} };
	var p = root();
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${$$props.other ?? ''} ${rest.value ?? ''} ${rest['other'] ?? ''}`));
	$.append($$anchor, p);
	return $.pop($$exports);
}

customElements.define('my-element', $.create_custom_element(Options_custom_rest_access, { value: {} }, [], [], { mode: 'open' }));
