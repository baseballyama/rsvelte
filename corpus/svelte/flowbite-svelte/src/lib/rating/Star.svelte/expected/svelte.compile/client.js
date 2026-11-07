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

var root_2 = $.from_svg(`<svg><defs><linearGradient><!></linearGradient></defs><g stroke-width="2"><polygon points="165.000, 185.000, 188.511, 197.361, 184.021, 171.180, 
      203.042, 152.639, 176.756, 148.820, 165.000, 125.000, 
      153.244, 148.820, 126.958, 152.639, 145.979, 171.180,
      141.489, 197.361, 165.000, 185.000"></polygon></g></svg>`);

export default function Star($$anchor, $$props) {
	$.push($$props, true);

	let fillPercent = $.prop($$props, 'fillPercent', 3, 100),
		fillColor = $.prop($$props, 'fillColor', 3, "#F5CA14"),
		strokeColor = $.prop($$props, 'strokeColor', 3, "#F5CA14"),
		size = $.prop($$props, 'size', 3, 24),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "star"),
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
			viewBox: '100 100 120 120',
			role: role()
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

	var g = $.sibling(defs);

	$.reset(svg);

	$.template_effect(() => {
		$.set_attribute(linearGradient, 'id', $.get(uniqueId));
		$.set_attribute(g, 'fill', `url(#${$.get(uniqueId) ?? ''})`);
		$.set_attribute(g, 'stroke', strokeColor());
	});

	$.append($$anchor, svg);
	$.pop();
}