import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_svg(`<svg><rect x="3" y="11.4853" width="12" height="1.5" rx="0.75" transform="rotate(-45 3 11.4853)" fill="#C2410C"></rect><rect x="7" y="12.6569" width="8" height="1.5" rx="0.75" transform="rotate(-45 7 12.6569)" fill="#C2410C"></rect><rect x="10.25" y="14" width="6" height="1.5" rx="0.75" transform="rotate(-90 10.25 14)" fill="black" class="dark:fill-white"></rect><rect x="8" y="10.25" width="6" height="1.5" rx="0.75" fill="black" class="dark:fill-white"></rect></svg>`);

export default function Logo($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var svg = root();

	$.attribute_effect(
		svg,
		($0) => ({
			...rest,
			viewBox: '0 0 16 16',
			fill: 'none',
			xmlns: 'http://www.w3.org/2000/svg',
			class: $0
		}),
		[() => cn('size-4', $$props.class)]
	);

	$.append($$anchor, svg);
	$.pop();
}