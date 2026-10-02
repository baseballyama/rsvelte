import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'fillPercent',
	'fillColor',
	'strokeColor',
	'size',
	'ariaLabel',
	'iconIndex',
	'groupId',
	'role',
	'svgClass',
	'pathd'
]);

var root = $.from_svg(`<stop offset="0%"></stop><stop></stop><stop stop-color="transparent"></stop><stop offset="100%" stop-color="transparent"></stop>`, 1);
var root_1 = $.from_svg(`<stop offset="0%"></stop><stop offset="100%"></stop>`, 1);
var root_2 = $.from_svg(`<svg><defs><linearGradient x1="0%" y1="0%" x2="100%" y2="0%"><!></linearGradient></defs><path stroke-linecap="round" stroke-linejoin="round"></path></svg>`);

export default function CustomIcon($$anchor, $$props) {
	$.push($$props, true);

	let fillPercent = $.prop($$props, 'fillPercent', 3, 100),
		fillColor = $.prop($$props, 'fillColor', 3, "#00ff00"),
		strokeColor = $.prop($$props, 'strokeColor', 3, "#00ff00"),
		size = $.prop($$props, 'size', 3, 24),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "custom icon"),
		iconIndex = $.prop($$props, 'iconIndex', 3, 0),
		groupId = $.prop($$props, 'groupId', 3, "custom"),
		role = $.prop($$props, 'role', 3, "img"),
		pathd = $.prop($$props, 'pathd', 3, "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"),
		restProps = $.rest_props($$props, rest_excludes);

	const uniqueId = $.derived(() => `${groupId()}-${iconIndex()}`);
	var svg = root_2();

	$.attribute_effect(
		svg,
		($0) => ({
			width: size(),
			height: size(),
			class: $0,
			...restProps,
			'aria-label': ariaLabel(),
			viewBox: '0 0 24 24',
			role: role(),
			'stroke-width': '1.5'
		}),
		[() => clsx($$props.svgClass)]
	);

	var defs = $.child(svg);
	var linearGradient = $.child(defs);
	var node = $.child(linearGradient);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var stop = $.first_child(fragment);
			var stop_1 = $.sibling(stop);
			var stop_2 = $.sibling(stop_1);

			$.next();

			$.template_effect(() => {
				$.set_attribute(stop, 'stop-color', fillColor());
				$.set_attribute(stop_1, 'offset', `${fillPercent() ?? ''}%`);
				$.set_attribute(stop_1, 'stop-color', fillColor());
				$.set_attribute(stop_2, 'offset', `${fillPercent() ?? ''}%`);
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = root_1();
			var stop_3 = $.first_child(fragment_1);
			var stop_4 = $.sibling(stop_3);

			$.template_effect(() => {
				$.set_attribute(stop_3, 'stop-color', fillColor());
				$.set_attribute(stop_4, 'stop-color', fillColor());
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (fillPercent() !== 100) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(linearGradient);
	$.reset(defs);

	var path = $.sibling(defs);

	$.reset(svg);

	$.template_effect(() => {
		$.set_attribute(linearGradient, 'id', $.get(uniqueId));
		$.set_attribute(path, 'd', pathd());
		$.set_attribute(path, 'fill', `url(#${$.get(uniqueId) ?? ''})`);
		$.set_attribute(path, 'stroke', strokeColor());
	});

	$.append($$anchor, svg);
	$.pop();
}