import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Add_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("flex h-9 items-center overflow-hidden rounded-md border border-border bg-background", className)),
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}