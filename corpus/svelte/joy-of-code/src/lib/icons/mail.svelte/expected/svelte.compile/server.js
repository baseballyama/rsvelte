import * as $ from 'svelte/internal/server';

export default function Mail($$renderer, $$props) {
	let { $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<svg${$.attributes(
		{
			xmlns: 'http://www.w3.org/2000/svg',
			width: '24',
			height: '24',
			viewBox: '0 0 24 24',
			fill: 'none',
			stroke: 'currentColor',
			'stroke-width': '2',
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
			...rest
		},
		void 0,
		void 0,
		void 0,
		3
	)}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`);
}