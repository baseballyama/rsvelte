import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<button> </button>`);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		properties = $.rest_props($$props, rest_excludes);

	var button = root();
	var event_handler = () => $.update_prop(value);

	$.attribute_effect(button, () => ({ ...properties, onclick: event_handler }));

	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, value()));
	$.append($$anchor, button);
	$.pop();
}