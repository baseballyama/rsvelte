import * as $ from 'svelte/internal/server';

export default function Stackblitz($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	$$renderer.push(`<svg${$.attributes(
		{
			viewBox: '0 0 28 28',
			'aria-hidden': 'true',
			height: '24',
			width: '24',
			...props
		},
		void 0,
		void 0,
		void 0,
		3
	)}><path fill="currentColor" d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.671-10.227z"></path></svg>`);
}