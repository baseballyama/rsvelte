import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Page_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<section${$.attributes({ class: $.clsx(cn("border-grid", className)), ...restProps })}><div class="container-wrapper"><div class="container flex flex-col items-center gap-2 py-8 text-center md:py-16 lg:py-20 xl:gap-4">`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div></section>`);
	});
}