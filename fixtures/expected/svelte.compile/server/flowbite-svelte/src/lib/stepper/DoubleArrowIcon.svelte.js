import * as $ from 'svelte/internal/server';

export default function DoubleArrowIcon($$renderer, $$props) {
	let { class: className, $$slots, $$events, ...restProps } = $$props;

	$$renderer.push(`<svg${$.attributes(
		{
			class: $.clsx(className || "ms-2 h-3 w-3 sm:ms-4 rtl:rotate-180"),
			'aria-hidden': 'true',
			xmlns: 'http://www.w3.org/2000/svg',
			fill: 'none',
			viewBox: '0 0 12 10',
			stroke: 'currentColor',
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
			'stroke-width': '2',
			...restProps
		},
		void 0,
		void 0,
		void 0,
		3
	)}><path d="m7 9 4-4-4-4M1 9l4-4-4-4"></path></svg>`);
}