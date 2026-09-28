import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Terminal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<svg${$.attributes(
			{
				class: $.clsx(cn("size-4", className)),
				fill: 'none',
				stroke: 'currentColor',
				'stroke-width': '2',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				viewBox: '0 0 24 24',
				xmlns: 'http://www.w3.org/2000/svg',
				...rest
			},
			void 0,
			void 0,
			void 0,
			3
		)}><polyline points="4,17 10,11 4,5"></polyline><line x1="12" x2="20" y1="19" y2="19"></line></svg>`);
	});
}