import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";
import { Popover } from "bits-ui";

export default function Popover_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		if (Popover.Content) {
			$$renderer.push('<!--[-->');

			Popover.Content($$renderer, $.spread_props([
				{
					class: cn("rounded-card border-border shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-popover-content-transform-origin) z-50 border-2 bg-zinc-50 p-4 dark:bg-[#121212]", className)
				},
				restProps
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}