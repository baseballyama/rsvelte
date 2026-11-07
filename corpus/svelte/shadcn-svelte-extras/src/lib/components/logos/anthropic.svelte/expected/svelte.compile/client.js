import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_svg(`<svg><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"></path></svg>`);

export default function Anthropic($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(
		svg,
		($0) => ({
			xmlns: 'http://www.w3.org/2000/svg',
			fill: 'currentColor',
			role: 'img',
			viewBox: '0 0 24 24',
			class: $0,
			'aria-hidden': 'true',
			...rest
		}),
		[() => cn('size-4 shrink-0', $$props.class)]
	);

	$.append($$anchor, svg);
	$.pop();
}