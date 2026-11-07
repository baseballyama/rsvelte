import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Page_nav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("container-wrapper scroll-mt-24", className)),
			...restProps
		})}><div class="container flex items-center justify-between gap-4 py-4">`);

		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}