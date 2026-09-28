import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Hr($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<hr${$.attributes({ class: $.clsx(cn("my-4 md:my-8", className)), ...restProps })}/>`);
	});
}