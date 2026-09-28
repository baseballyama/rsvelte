import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_svg(`<svg><rect width="256" height="256" fill="none"></rect><line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="#EB4F27" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line><line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="#EB4F27" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line></svg>`);

export default function Shadcn_svelte($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(
		svg,
		($0) => ({
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 256 256',
			class: $0,
			'aria-hidden': 'true',
			...rest
		}),
		[() => cn('size-4 shrink-0', $$props.class)]
	);

	$.append($$anchor, svg);
	$.pop();
}