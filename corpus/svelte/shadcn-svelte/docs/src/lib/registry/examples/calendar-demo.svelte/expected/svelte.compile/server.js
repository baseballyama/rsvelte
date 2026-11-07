import * as $ from 'svelte/internal/server';
import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar } from "$lib/registry/ui/calendar/index.js";

export default function Calendar_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = today(getLocalTimeZone());
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Calendar($$renderer, {
				type: 'single',
				class: 'rounded-md border shadow-sm',
				captionLayout: 'dropdown',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}