import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Stepper_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, step, $$slots, $$events, ...props } = $$props;

		$$renderer.push(`<button${$.attributes({ class: $.clsx(cn("bg-blue-500", className)), ...props })}>${$.escape(step)}</button>`);
	});
}