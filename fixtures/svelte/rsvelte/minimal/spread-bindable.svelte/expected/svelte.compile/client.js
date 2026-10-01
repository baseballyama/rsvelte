import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'text']);
var root = $.from_html(`<button> </button> <p> </p>`, 1);

export default function Spread_bindable($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		text = $.prop($$props, 'text', 11, 'x'),
		properties = $.rest_props($$props, rest_excludes);

	var fragment = root();
	var button = $.first_child(fragment);
	var event_handler = () => $.update_prop(value);

	$.attribute_effect(button, () => ({ ...properties, onclick: event_handler }));

	var text_1 = $.only_child(button, true);
	var p = $.sibling(button, 2);
	var text_2 = $.only_child(p, true);

	$.template_effect(() => {
		$.set_text(text_1, value());
		$.set_attribute(p, 'title', text());
		$.set_text(text_2, text());
	});

	$.append($$anchor, fragment);
	$.pop();
}