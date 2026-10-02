import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Code($$renderer, $$props) {
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
		)}><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>`);
	});
}