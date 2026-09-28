import * as $ from 'svelte/internal/server';

export default function Chevron_double_left($$renderer, $$props) {
	let { $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<svg${$.attributes(
		{
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 24 24',
			'stroke-width': '2',
			stroke: 'currentColor',
			fill: 'none',
			...rest
		},
		void 0,
		void 0,
		void 0,
		3
	)}><path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"></path></svg>`);
}