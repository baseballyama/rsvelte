import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Page_header_heading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<h1${$.attributes({
			class: $.clsx(cn("scroll-m-20 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></h1>`);
	});
}