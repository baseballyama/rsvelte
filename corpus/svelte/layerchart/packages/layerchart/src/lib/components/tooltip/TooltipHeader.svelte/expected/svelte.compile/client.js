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
	'colorRef',
	'value',
	'format',
	'color',
	'classes',
	'props',
	'class',
	'children'
]);

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div><!> <!></div>`);

export default function TooltipHeader($$anchor, $$props) {
	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		colorRefProp = $.prop($$props, 'colorRef', 15),
		classes = $.prop($$props, 'classes', 19, () => ({ root: '', color: '' })),
		props = $.prop($$props, 'props', 19, () => ({ root: {}, color: {} })),
		restProps = $.rest_props($$props, rest_excludes);

	let ref = $.state(void 0);
	let colorRef = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	$.user_pre_effect(() => {
		colorRefProp($.get(colorRef));
	});

	var div = root_1();

	$.attribute_effect(
		div,
		($0) => ({ class: $0, ...restProps }),
		[
			() => cls('lc-tooltip-header', classes().root, props().root?.class, $$props.class)
		],
		void 0,
		void 0,
		'svelte-18kx2t4'
	);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			let styles;

			$.bind_this(div_1, ($$value) => $.set(colorRef, $$value), () => $.get(colorRef));

			$.template_effect(
				($0) => {
					$.set_class(div_1, 1, $0, 'svelte-18kx2t4');
					styles = $.set_style(div_1, '', styles, { '--color': $$props.color });
				},
				[
					() => $.clsx(cls('lc-tooltip-header-color', classes().color))
				]
			);

			$.append($$anchor, div_1);
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

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var text = $.text();

			$.template_effect(($0) => $.set_text(text, $0), [
				() => $$props.format
					? formatUtil($$props.value, asAny($$props.format))
					: $$props.value
			]);

			$.append($$anchor, text);
		};

		$.if(node_1, ($$render) => {
			if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(ref, $$value), () => $.get(ref));
	$.append($$anchor, div);
	$.pop();
}