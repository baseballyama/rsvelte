import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from './button.svelte';

var root = $.from_html(`<!> <button> </button>`, 1);

export default function Main($$anchor) {
	let value = $.state(0);
	const props = { class: 'foo' };
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, $.spread_props(() => props, {
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	}));

	var button = $.sibling(node, 2);
	var event_handler = () => $.update(value);

	$.attribute_effect(button, () => ({ ...props, onclick: event_handler }));

	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(value)));
	$.append($$anchor, fragment);
}