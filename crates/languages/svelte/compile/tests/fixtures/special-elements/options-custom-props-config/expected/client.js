import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Options_custom_props_config($$anchor, $$props) {
	$.push($$props, true);
	let enabled = $.prop($$props, 'enabled', 7, false), count = $.prop($$props, 'count', 7);
	var $$exports = { get enabled() {
		return enabled();
	}, set enabled($$value = false) {
		enabled($$value);
		$.flush();
	}, get count() {
		return count();
	}, set count($$value) {
		count($$value);
		$.flush();
	} };
	var p = root();
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${enabled() ?? ''}: ${count() ?? ''}`));
	$.append($$anchor, p);
	return $.pop($$exports);
}

customElements.define("my-element", $.create_custom_element(Options_custom_props_config, { enabled: { reflect: true, type: 'Boolean' }, count: { attribute: "data-count", type: "Number" } }, [], [], { mode: 'open' }));
