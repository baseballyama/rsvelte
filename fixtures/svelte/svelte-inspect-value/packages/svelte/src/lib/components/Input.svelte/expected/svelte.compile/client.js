import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useOptions } from '../options.svelte.js';
import { slide } from '../transition/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'busy',
	'disabled',
	'value',
	'class',
	'transition',
	'transitionParams',
	'containerAttrs',
	'icon'
]);

var root = $.from_html(`<div class="icon svelte-x5on4q"><!></div>`);
var root_1 = $.from_html(`<div><input/> <!></div>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const options = useOptions();

	let value = $.prop($$props, 'value', 15, ''),
		transition = $.prop($$props, 'transition', 3, slide),
		transitionParams = $.prop($$props, 'transitionParams', 19, () => ({ duration: options.transitionDuration })),
		containerAttrs = $.prop($$props, 'containerAttrs', 19, () => ({})),
		rest = $.rest_props($$props, rest_excludes);

	let input = $.state(void 0);

	function focus() {
		$.get(input)?.focus();
	}

	var $$exports = { focus };
	var div = root_1();

	$.attribute_effect(div, () => ({ class: 'siv-input', ...containerAttrs() }), void 0, void 0, void 0, 'svelte-x5on4q');

	var input_1 = $.child(div);

	$.attribute_effect(
		input_1,
		() => ({
			class: $$props.class,
			type: 'text',
			disabled: $$props.disabled || $$props.busy,
			'aria-busy': $$props.busy,
			...rest
		}),
		void 0,
		void 0,
		void 0,
		'svelte-x5on4q',
		true
	);

	$.bind_this(input_1, ($$value) => $.set(input, $$value), () => $.get(input));

	var node = $.sibling(input_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			$.snippet(node_1, () => $$props.icon);
			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.icon) $$render(consequent);
		});
	}

	$.reset(div);
	$.bind_value(input_1, value);
	$.transition(3, div, transition, () => ({ ...transitionParams(), duration: options.transitionDuration }));
	$.append($$anchor, div);

	return $.pop($$exports);
}