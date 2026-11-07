import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from '$lib/transition/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'duration',
	'checked'
]);

var root = $.from_html(`<button><!></button>`);

export default function ToggleButton($$anchor, $$props) {
	$.push($$props, true);

	let duration = $.prop($$props, 'duration', 3, 400),
		checked = $.prop($$props, 'checked', 15, false),
		rest = $.rest_props($$props, rest_excludes);

	var button = root();
	var event_handler = () => checked(!checked());

	$.attribute_effect(
		button,
		() => ({
			type: 'button',
			onclick: event_handler,
			...rest,
			[$.CLASS]: { checked: checked() }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-1kw2gel'
	);

	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button);
	$.transition(3, button, () => slide, () => ({ axis: 'x', duration: duration() }));
	$.append($$anchor, button);
	$.pop();
}