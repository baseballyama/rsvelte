import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Page_header_description($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<p${$.attributes({
			class: $.clsx(cn("text-foreground/40 mt-3 text-balance text-lg font-semibold leading-7 tracking-[-0.01em] sm:text-[21px]", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></p>`);
	});
}