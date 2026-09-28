import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Example_wrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div class="w-full bg-background"><div${$.attributes({
			'data-slot': 'example-wrapper',
			class: $.clsx(cn("mx-auto grid min-h-screen w-full max-w-5xl min-w-0 content-center items-start gap-8 p-4 pt-2 sm:gap-12 sm:p-6 md:grid-cols-2 md:gap-8 lg:p-12 2xl:max-w-6xl", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}