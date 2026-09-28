import * as $ from 'svelte/internal/server';
import clsx from "clsx";

export default function CheckIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<svg${$.attributes(
			{
				xmlns: 'http://www.w3.org/2000/svg',
				width: '16',
				height: '16',
				viewBox: '0 0 24 24',
				fill: 'none',
				stroke: 'currentColor',
				'stroke-width': '2',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				class: $.clsx(clsx(className)),
				...restProps
			},
			void 0,
			void 0,
			void 0,
			3
		)}><polyline points="20 6 9 17 4 12"></polyline></svg>`);
	});
}