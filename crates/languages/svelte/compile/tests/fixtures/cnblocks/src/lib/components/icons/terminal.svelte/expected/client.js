import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_svg(`<svg><polyline points="4,17 10,11 4,5"></polyline><line x1="12" x2="20" y1="19" y2="19"></line></svg>`);

export default function Terminal($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(
		svg,
		($0) => ({
			class: $0,
			fill: 'none',
			stroke: 'currentColor',
			'stroke-width': '2',
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
			viewBox: '0 0 24 24',
			xmlns: 'http://www.w3.org/2000/svg',
			...rest
		}),
		[() => cn("size-4", $$props.class)]
	);

	$.append($$anchor, svg);
	$.pop();
}