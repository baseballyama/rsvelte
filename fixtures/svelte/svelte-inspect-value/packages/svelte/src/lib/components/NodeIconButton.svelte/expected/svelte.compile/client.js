import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useOptions } from '../options.svelte.js';
import { slide } from '../transition/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'success',
	'transition',
	'transitionParams'
]);

var root = $.from_html(`<button><!></button>`);

export default function NodeIconButton($$anchor, $$props) {
	$.push($$props, true);

	const options = useOptions();

	let success = $.prop($$props, 'success', 3, false),
		transition = $.prop($$props, 'transition', 3, slide),
		transitionParams = $.prop($$props, 'transitionParams', 19, () => ({ axis: 'x', duration: options.transitionDuration })),
		rest = $.rest_props($$props, rest_excludes);

	let button = $.state(void 0);

	function focus() {
		$.get(button)?.focus();
	}

	var $$exports = { focus };
	var button_1 = root();

	$.attribute_effect(
		button_1,
		() => ({
			class: 'node-icon-button',
			type: 'button',
			...rest,
			[$.CLASS]: { success: success() }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-5ibkxh'
	);

	var node = $.child(button_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button_1);
	$.bind_this(button_1, ($$value) => $.set(button, $$value), () => $.get(button));
	$.transition(3, button_1, transition, () => ({ duration: options.transitionDuration, ...transitionParams() }));
	$.append($$anchor, button_1);

	return $.pop($$exports);
}