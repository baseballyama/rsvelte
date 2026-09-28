import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Page_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<section${$.attributes({ class: $.clsx(cn("relative", className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></section>`);
	});
}