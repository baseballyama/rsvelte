import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', '$$host']);

var root = $.from_html(`<p> </p>`);

export default function Options_custom_props_identifier($$anchor, $$props) {
	$.push($$props, true);
	let props = $.rest_props($$props, rest_excludes);
	var p = root();
	var text = $.only_child(p, true);
	$.template_effect(() => $.set_text(text, $$props.value));
	$.append($$anchor, p);
	$.pop();
}

customElements.define('my-element', $.create_custom_element(Options_custom_props_identifier, {}, [], [], { mode: 'open' }));
