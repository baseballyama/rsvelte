import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_svg(`<svg><g fill="currentColor"><path fill-rule="evenodd" d="M15 10a5 5 0 0 0-5 5v98a5 5 0 0 0 5 5h178a5 5 0 0 0 5-5V15a5 5 0 0 0-5-5zM0 15A15 15 0 0 1 15 0h178a15 15 0 0 1 15 15v98a15 15 0 0 1-15 15H15a15 15 0 0 1-15-15z" clip-rule="evenodd"></path><path d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zm125 0-30-33h20V30h20v35h20z"></path></g></svg>`);

export default function Markdown($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(
		svg,
		($0) => ({
			viewBox: '0 0 208 128',
			xmlns: 'http://www.w3.org/2000/svg',
			fill: 'none',
			class: $0,
			'aria-hidden': 'true',
			...rest
		}),
		[() => cn('size-4 shrink-0', $$props.class)]
	);

	$.append($$anchor, svg);
	$.pop();
}