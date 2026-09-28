import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Tab($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({ class: $.clsx(cn(className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}