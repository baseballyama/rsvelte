import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Markdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<svg${$.attributes(
			{
				viewBox: '0 0 208 128',
				'xml:space': 'preserve',
				class: $.clsx(cn("size-4", className)),
				...rest
			},
			void 0,
			void 0,
			void 0,
			3
		)}><path fill="none" stroke="currentColor" stroke-width="10" d="M15 5h178a10 10 0 0 1 10 10v98a10 10 0 0 1-10 10H15a10 10 0 0 1-10-10V15A10 10 0 0 1 15 5z"></path><path fill="currentColor" d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39H30zm125 0-30-33h20V30h20v35h20l-30 33z"></path></svg>`);
	});
}