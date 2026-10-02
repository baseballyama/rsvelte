import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";

export default function Calendar_03($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = [new CalendarDate(2025, 6, 12), new CalendarDate(2025, 7, 24)];

		// svelte-ignore state_referenced_locally
		let placeholder = value[0];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Calendar($$renderer, {
				type: 'multiple',
				maxDays: 5,
				class: 'rounded-lg border shadow-sm',
				numberOfMonths: 2,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				get placeholder() {
					return placeholder;
				},

				set placeholder($$value) {
					placeholder = $$value;
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