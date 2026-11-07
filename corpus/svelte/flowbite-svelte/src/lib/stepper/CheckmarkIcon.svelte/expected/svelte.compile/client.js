import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'variant']);
var root = $.from_svg(`<polyline></polyline>`);
var root_1 = $.from_svg(`<path></path>`);
var root_2 = $.from_svg(`<svg><!></svg>`);

export default function CheckmarkIcon($$anchor, $$props) {
	let variant = $.prop($$props, 'variant', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	// 1. 'default' (Check inside a circle) - FILL ICON
	const defaultIconProps = {
		viewBox: "0 0 20 20",
		fill: "currentColor",
		pathData: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z",
		stroke: undefined,
		"stroke-linecap": undefined,
		"stroke-linejoin": undefined,
		"stroke-width": undefined
	};

	// 2. 'simple' (Basic check stroke path) - STROKE ICON
	const simpleIconProps = {
		viewBox: "0 0 16 12",
		fill: "none",
		pathData: "M1 5.917 5.724 10.5 15 1.5",
		stroke: "currentColor",
		"stroke-linecap": "round",
		"stroke-linejoin": "round",
		"stroke-width": "2"
	};

	// 3. 'tick' (New V-shaped check stroke) - STROKE ICON
	const polylineIconProps = {
		viewBox: "0 0 24 24",
		fill: "none",
		pointsData: "20 6 9 17 4 12",
		stroke: "currentColor",
		"stroke-width": "2",
		"stroke-linecap": "round",
		"stroke-linejoin": "round"
	};

	// Select the appropriate props based on the variant
	const iconProps = $.derived(() => variant() === "simple"
		? simpleIconProps
		: variant() === "tick" ? polylineIconProps : defaultIconProps);

	// Determine the base class for the SVG
	const baseClass = $.derived(() => $$props.class || (variant() !== "default" ? "h-4 w-4" : "me-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4"));

	var svg = root_2();

	$.attribute_effect(svg, () => ({
		class: $.get(baseClass),
		'aria-hidden': 'true',
		xmlns: 'http://www.w3.org/2000/svg',
		viewBox: $.get(iconProps).viewBox,
		fill: $.get(iconProps).fill,
		stroke: $.get(iconProps).stroke,
		'stroke-width': $.get(iconProps)["stroke-width"],
		'stroke-linecap': $.get(iconProps)["stroke-linecap"],
		'stroke-linejoin': $.get(iconProps)["stroke-linejoin"],
		...restProps
	}));

	var node = $.child(svg);

	{
		var consequent = ($$anchor) => {
			var polyline = root();

			$.template_effect(() => $.set_attribute(polyline, 'points', $.get(iconProps).pointsData));
			$.append($$anchor, polyline);
		};

		var alternate = ($$anchor) => {
			var path = root_1();

			$.template_effect(() => $.set_attribute(path, 'd', $.get(iconProps).pathData));
			$.append($$anchor, path);
		};

		$.if(node, ($$render) => {
			if ($.get(iconProps).pointsData) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(svg);
	$.append($$anchor, svg);
}