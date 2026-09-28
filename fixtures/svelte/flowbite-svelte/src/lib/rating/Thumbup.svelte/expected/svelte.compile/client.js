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
	'svgClass'
]);

var root = $.from_svg(`<stop offset="0%"></stop><stop></stop><stop stop-color="transparent"></stop><stop offset="100%" stop-color="transparent"></stop>`, 1);
var root_1 = $.from_svg(`<stop offset="0%"></stop><stop offset="100%"></stop>`, 1);
var root_2 = $.from_svg(`<svg><defs><linearGradient><!></linearGradient></defs><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"></path></svg>`);

export default function Thumbup($$anchor, $$props) {
	$.push($$props, true);

	let fillPercent = $.prop($$props, 'fillPercent', 3, 100),
		fillColor = $.prop($$props, 'fillColor', 3, "#00b500"),
		strokeColor = $.prop($$props, 'strokeColor', 3, "#00b500"),
		size = $.prop($$props, 'size', 3, 24),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "thumbup"),
		iconIndex = $.prop($$props, 'iconIndex', 3, 0),
		groupId = $.prop($$props, 'groupId', 3, "star"),
		role = $.prop($$props, 'role', 3, "img"),
		restProps = $.rest_props($$props, rest_excludes);

	const uniqueId = $.derived(() => `${groupId()}-${iconIndex()}`);
	var svg = root_2();

	$.attribute_effect(
		svg,
		($0) => ({
			width: size(),
			height: size(),
			...restProps,
			class: $0,
			'aria-label': ariaLabel(),
			viewBox: '0 0 24 24',
			role: role(),
			'stroke-width': '1.5',
			stroke: 'currentColor',
			fill: 'none'
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
		$.set_attribute(path, 'fill', `url(#${$.get(uniqueId) ?? ''})`);
		$.set_attribute(path, 'stroke', strokeColor());
	});

	$.append($$anchor, svg);
	$.pop();
}