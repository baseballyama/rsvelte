import 'svelte/internal/disclose-version';
import { mergeProps } from '@zag-js/svelte';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_svg(`<svg><path d="M20 6 9 17l-5-5"></path></svg>`);

export default function Check($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const rest = $.derived(() => $.exclude_from_object(props, []));

	const attributes = $.derived(() => mergeProps(
		{
			xmlns: 'http://www.w3.org/2000/svg',
			width: '24',
			height: '24',
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			'stroke-width': '2',
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round'
		},
		$.get(rest)
	));

	var svg = root();

	$.attribute_effect(svg, () => ({ ...$.get(attributes) }));
	$.append($$anchor, svg);
	$.pop();
}