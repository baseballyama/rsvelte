import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Tr($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<tr${$.attributes({ class: $.clsx(cn("m-0 border-b", className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></tr>`);
	});
}