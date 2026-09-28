import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Linked_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			href,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<a${$.attributes({
			href,
			class: $.clsx(cn("flex w-full flex-col items-center rounded-xl bg-surface p-6 text-surface-foreground transition-colors hover:bg-surface/80 sm:p-10", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></a>`);
	});
}