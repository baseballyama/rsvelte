import * as $ from 'svelte/internal/server';

export default function Menu($$renderer, $$props) {
	let { $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<svg${$.attributes(
		{
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 24 24',
			stroke: 'currentColor',
			fill: 'none',
			...rest
		},
		void 0,
		void 0,
		void 0,
		3
	)}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path></svg>`);
}