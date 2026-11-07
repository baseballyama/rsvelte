import * as $ from 'svelte/internal/server';

export default function Maia($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	$$renderer.push(`<svg${$.attributes(
		{
			xmlns: 'http://www.w3.org/2000/svg',
			width: '128',
			height: '128',
			viewBox: '0 0 24 24',
			fill: 'none',
			role: 'img',
			color: 'currentColor',
			...restProps
		},
		void 0,
		void 0,
		void 0,
		3
	)}><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></circle></svg>`);
}