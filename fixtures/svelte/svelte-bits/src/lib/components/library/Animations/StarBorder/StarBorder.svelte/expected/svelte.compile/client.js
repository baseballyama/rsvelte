import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'as',
	'class',
	'color',
	'speed',
	'thickness'
]);

var root = $.from_html(`<div class="star-sweep-bottom absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full z-0 svelte-1367xib"></div> <div class="star-sweep-top absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full z-0 svelte-1367xib"></div> <div class="relative z-1 bg-gradient-to-b from-black to-gray-900 border border-gray-800 text-white text-center text-[16px] py-[16px] px-[26px] rounded-[20px] svelte-1367xib"><!></div>`, 1);

export default function StarBorder($$anchor, $$props) {
	let as = $.prop($$props, 'as', 3, 'button'),
		className = $.prop($$props, 'class', 3, ''),
		color = $.prop($$props, 'color', 3, 'white'),
		speed = $.prop($$props, 'speed', 3, '6s'),
		thickness = $.prop($$props, 'thickness', 3, 1),
		rest = $.rest_props($$props, rest_excludes);

	const gradientBg = $.derived(() => `radial-gradient(circle, ${color()}, transparent 10%)`);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, as, false, ($$element, $$anchor) => {
		$.attribute_effect(
			$$element,
			() => ({
				class: `star-border relative inline-block overflow-hidden rounded-[20px] ${className() ?? ''}`,
				...rest,
				[$.STYLE]: { padding: `${thickness() ?? ''}px 0` }
			}),
			void 0,
			void 0,
			void 0,
			'svelte-1367xib'
		);

		var fragment_1 = root();
		var div = $.first_child(fragment_1);
		let styles;
		var div_1 = $.sibling(div, 2);
		let styles_1;
		var div_2 = $.sibling(div_1, 2);
		var node_1 = $.child(div_2);

		$.snippet(node_1, () => $$props.children ?? $.noop);
		$.reset(div_2);

		$.template_effect(() => {
			styles = $.set_style(div, '', styles, { background: $.get(gradientBg), 'animation-duration': speed() });
			styles_1 = $.set_style(div_1, '', styles_1, { background: $.get(gradientBg), 'animation-duration': speed() });
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
}