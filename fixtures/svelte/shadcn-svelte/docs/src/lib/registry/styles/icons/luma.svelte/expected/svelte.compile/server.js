import * as $ from 'svelte/internal/server';

export default function Luma($$renderer, $$props) {
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
	)}><path d="M2 12C2 8.134 5.134 5 9 5H15C18.866 5 22 8.134 22 12C22 15.866 18.866 19 15 19H9C5.134 19 2 15.866 2 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>`);
}