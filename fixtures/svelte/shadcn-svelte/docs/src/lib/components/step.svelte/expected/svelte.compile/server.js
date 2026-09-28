import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Step($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...props } = $$props;

		$$renderer.push(`<div${$.attributes({
			role: 'heading',
			'aria-level': '3',
			class: $.clsx(cn("mt-8 scroll-m-32 font-heading text-base font-medium tracking-tight", className)),
			...props
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}