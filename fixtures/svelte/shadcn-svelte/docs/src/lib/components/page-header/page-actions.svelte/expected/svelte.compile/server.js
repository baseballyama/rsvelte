import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Page_actions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("flex w-full items-center justify-center gap-2 pt-2 **:data-[slot=button]:shadow-none", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}