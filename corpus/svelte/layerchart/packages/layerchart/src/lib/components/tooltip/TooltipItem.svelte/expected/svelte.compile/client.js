import 'svelte/internal/disclose-version';
import { asAny } from '$lib/utils/types.js';
import * as $ from 'svelte/internal/client';
import { format as formatUtil } from '@layerstack/utils';
import { cls } from '@layerstack/tailwind';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'labelRef',
	'valueRef',
	'colorRef',
	'label',
	'value',
	'format',
	'valueAlign',
	'color',
	'classes',
	'props',
	'class',
	'children'
]);

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div><div><!> <!></div> <div><!></div></div>`);

export default function TooltipItem($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		labelRefProp = $.prop($$props, 'labelRef', 15),
		valueRefProp = $.prop($$props, 'valueRef', 15),
		colorRefProp = $.prop($$props, 'colorRef', 15),
		valueAlign = $.prop($$props, 'valueAlign', 3, 'left'),
		classes = $.prop($$props, 'classes', 19, () => ({ root: '', label: '', value: '', color: '' })),
		props = $.prop($$props, 'props', 19, () => ({ root: {}, label: {}, value: {}, color: {} })),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);
	let labelRef = $.state(void 0);
	let valueRef = $.state(void 0);
	let colorRef = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	$.user_pre_effect(() => {
		labelRefProp($.get(labelRef));
	});

	$.user_pre_effect(() => {
		valueRefProp($.get(valueRef));
	});

	$.user_pre_effect(() => {
		colorRefProp($.get(colorRef));
	});

	var div = root_1();

	$.attribute_effect(
		div,
		($0) => ({ ...props().root, class: $0, ...restProps }),
		[
			() => cls('lc-tooltip-item-root', classes().root, $$props.class, props().root?.class)
		],
		void 0,
		void 0,
		'svelte-3cu8im'
	);

	var div_1 = $.child(div);

	$.attribute_effect(
		div_1,
		($0) => ({ ...props().label, class: $0 }),
		[
			() => cls('lc-tooltip-item-label', 'label', classes().label, props().label?.class)
		],
		void 0,
		void 0,
		'svelte-3cu8im'
	);

	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();

			$.attribute_effect(
				div_2,
				($0) => ({
					...props().color,
					class: $0,
					[$.STYLE]: { '--color': $$props.color }
				}),
				[
					() => cls('lc-tooltip-item-color', 'color', classes().color, props().color?.class)
				],
				void 0,
				void 0,
				'svelte-3cu8im'
			);

			$.bind_this(div_2, ($$value) => $.set(colorRef, $$value), () => $.get(colorRef));
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($$props.color) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.label);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.label));
			$.append($$anchor, text);
		};

		$.if(node_1, ($$render) => {
			if (typeof $$props.label === 'function') $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => $.set(labelRef, $$value), () => $.get(labelRef));

	var div_3 = $.sibling(div_1, 2);

	$.attribute_effect(
		div_3,
		($0) => ({ ...props().value, class: $0, 'data-align': valueAlign() }),
		[
			() => cls('lc-tooltip-item-value', 'value', classes().value, props().value?.class)
		],
		void 0,
		void 0,
		'svelte-3cu8im'
	);

	var node_3 = $.child(div_3);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			$.snippet(node_4, () => $$props.children);
			$.append($$anchor, fragment_2);
		};

		var alternate_1 = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(($0) => $.set_text(text_1, $0), [
				() => $$props.format
					? formatUtil($$props.value, asAny($$props.format))
					: $$props.value
			]);

			$.append($$anchor, text_1);
		};

		$.if(node_3, ($$render) => {
			if ($$props.children) $$render(consequent_2); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_3);
	$.bind_this(div_3, ($$value) => $.set(valueRef, $$value), () => $.get(valueRef));
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.append($$anchor, div);
	$.pop();
}