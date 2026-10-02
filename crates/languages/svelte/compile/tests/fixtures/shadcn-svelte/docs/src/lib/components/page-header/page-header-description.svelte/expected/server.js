import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Page_header_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<p${$.attributes({
			class: $.clsx(cn("max-w-3xl text-base text-balance text-foreground sm:text-lg", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></p>`);
	});
}