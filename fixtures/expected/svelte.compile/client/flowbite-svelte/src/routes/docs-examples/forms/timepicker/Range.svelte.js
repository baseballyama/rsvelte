import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Timepicker, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Range($$anchor) {
	let selectedTimeRange = $.state($.proxy({ time: "09:00", endTime: "17:00" }));

	function handleRangeChange(data) {
		if (data) {
			$.set(selectedTimeRange, { time: data.time, endTime: data.endTime }, true);
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Label(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select Time Range:');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Timepicker(node_1, {
		type: 'range',
		onselect: handleRangeChange,
		get value() {
			return $.get(selectedTimeRange).time;
		},

		get endValue() {
			return $.get(selectedTimeRange).endTime;
		},
		divClass: 'shadow-none'
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `Selected Range: ${$.get(selectedTimeRange).time ?? ''} - ${$.get(selectedTimeRange).endTime ?? ''}`));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}