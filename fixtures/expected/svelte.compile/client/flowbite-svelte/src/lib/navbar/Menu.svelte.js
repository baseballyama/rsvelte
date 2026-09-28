import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'size',
	'color',
	'variation',
	'ariaLabel',
	'class'
]);

var root = $.from_svg(`<svg></svg>`);

export default function Menu($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, "24"),
		color = $.prop($$props, 'color', 3, "currentColor"),
		variation = $.prop($$props, 'variation', 3, "outline"),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "bars 3"),
		restProps = $.rest_props($$props, rest_excludes);

	let viewBox = $.state("0 0 24 24");
	let svgpath = $.state("");
	let svgoutline = $.derived(() => `<path stroke="${color()}" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path> `);
	let svgsolid = $.derived(() => `<path fill="${color()}" clip-rule="evenodd" fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path> `);

	$.user_effect(() => {
		switch (variation()) {
			case "outline":
				$.set(svgpath, $.get(svgoutline), true);
				$.set(viewBox, "0 0 24 24");
				break;

			case "solid":
				$.set(svgpath, $.get(svgsolid), true);
				$.set(viewBox, "0 0 24 24");
				break;

			default:
				$.set(svgpath, $.get(svgoutline), true);
				$.set(viewBox, "0 0 24 24");
		}
	});

	var svg = root();

	$.attribute_effect(
		svg,
		($0) => ({
			xmlns: 'http://www.w3.org/2000/svg',
			role: 'button',
			tabindex: '0',
			width: size(),
			height: size(),
			class: $0,
			...restProps,
			'aria-label': ariaLabel(),
			fill: 'none',
			viewBox: $.get(viewBox),
			'stroke-width': '2'
		}),
		[() => clsx($$props.class)]
	);

	$.html(svg, () => $.get(svgpath), true);
	$.reset(svg);
	$.append($$anchor, svg);
	$.pop();
}