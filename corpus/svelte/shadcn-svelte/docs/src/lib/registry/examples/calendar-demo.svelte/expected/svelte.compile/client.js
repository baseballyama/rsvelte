import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar } from "$lib/registry/ui/calendar/index.js";

export default function Calendar_demo($$anchor, $$props) {
	$.push($$props, true);

	let value = today(getLocalTimeZone());

	Calendar($$anchor, {
		type: 'single',
		class: 'rounded-md border shadow-sm',
		captionLayout: 'dropdown',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	$.pop();
}