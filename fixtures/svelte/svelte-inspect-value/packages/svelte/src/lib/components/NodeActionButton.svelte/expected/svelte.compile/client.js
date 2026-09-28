import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'onclick',
	'busy',
	'disabled'
]);

var root = $.from_html(`<button><!></button>`);

export default function NodeActionButton($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let button = $.state(void 0);

	function focus() {
		$.get(button)?.focus();
	}

	var $$exports = { focus };
	var button_1 = root();
	var event_handler = (e) => e.stopPropagation();

	$.attribute_effect(
		button_1,
		() => ({
			type: 'button',
			disabled: $$props.disabled || $$props.busy,
			'aria-busy': $$props.busy,
			...rest,
			onclick: $$props.onclick,
			ondblclick: event_handler
		}),
		void 0,
		void 0,
		void 0,
		'svelte-1n0q7vk'
	);

	var node = $.child(button_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button_1);
	$.bind_this(button_1, ($$value) => $.set(button, $$value), () => $.get(button));
	$.append($$anchor, button_1);

	return $.pop($$exports);
}