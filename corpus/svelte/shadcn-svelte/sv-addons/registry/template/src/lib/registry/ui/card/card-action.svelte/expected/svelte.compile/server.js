import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Card_action($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'card-action',
			class: $.clsx(cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}