import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Stepper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({ class: $.clsx(cn("bg-background", className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}