import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useOptions } from '../options.svelte.js';
import { slide } from '../transition/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'onclick',
	'value',
	'prefix',
	'containerAttrs'
]);

var root = $.from_html(`<div class="prefix svelte-1m3mdsy"> </div>`);
var root_1 = $.from_html(`<div><!> <select><!></select></div>`);

export default function Select($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, undefined),
		containerAttrs = $.prop($$props, 'containerAttrs', 19, () => ({})),
		rest = $.rest_props($$props, rest_excludes);

	const options = useOptions();
	let button = $.state(void 0);

	function focus() {
		$.get(button)?.focus();
	}

	var $$exports = { focus };
	var div = root_1();

	$.attribute_effect(
		div,
		() => ({
			class: 'inspect-select',
			...containerAttrs(),
			[$.CLASS]: { 'with-prefix': $$props.prefix }
		}),
		void 0,
		void 0,
		void 0,
		'svelte-1m3mdsy'
	);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var text = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text, $$props.prefix));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($$props.prefix) $$render(consequent);
		});
	}

	var select = $.sibling(node, 2);

	$.attribute_effect(select, () => ({ ...rest, [$.CLASS]: { prefixed: $$props.prefix != null } }), void 0, void 0, void 0, 'svelte-1m3mdsy');

	$.customizable_select(select, () => {
		var anchor = $.child(select);
		var fragment = $.comment();
		var node_1 = $.first_child(fragment);

		$.snippet(node_1, () => $$props.children ?? $.noop);
		$.append(anchor, fragment);
	});

	$.bind_this(select, ($$value) => $.set(button, $$value), () => $.get(button));
	$.reset(div);
	$.bind_select_value(select, value);
	$.transition(3, div, () => slide, () => ({ duration: options.transitionDuration, axis: 'x' }));
	$.append($$anchor, div);

	return $.pop($$exports);
}