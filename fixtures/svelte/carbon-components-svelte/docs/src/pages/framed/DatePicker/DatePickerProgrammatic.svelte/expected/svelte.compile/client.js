import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DatePickerProgrammatic($$anchor, $$props) {
	$.push($$props, true);

	let valueFrom = "01/01/2024";
	let valueTo = "01/31/2024";

	function advanceMonth(value) {
		var d = new Date(value);
		var month = d.getMonth() + 1;
		var year = d.getFullYear() + (month > 11 ? 1 : 0);

		month = month % 12;

		var lastDay = new Date(year, month + 1, 0).getDate();
		var day = Math.min(d.getDate(), lastDay);
		var mm = String(month + 1).padStart(2, "0");
		var dd = String(day).padStart(2, "0");

		return `${mm}/${dd}/${year}`;
	}

	function nextMonth() {
		valueFrom = advanceMonth(valueFrom);
		valueTo = advanceMonth(valueTo);
	}

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DatePicker(node, {
				datePickerType: 'range',
				get valueFrom() {
					return valueFrom;
				},

				set valueFrom($$value) {
					valueFrom = $$value;
				},

				get valueTo() {
					return valueTo;
				},

				set valueTo($$value) {
					valueTo = $$value;
				},

				$$events: {
					change: function ($$arg) {
						$.bubble_event.call(this, $$props, $$arg);
					}
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					DatePickerInput(node_1, { labelText: 'Start date', placeholder: 'mm/dd/yyyy' });

					var node_2 = $.sibling(node_1, 2);

					DatePickerInput(node_2, { labelText: 'End date', placeholder: 'mm/dd/yyyy' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			Button(node_3, {
				$$events: { click: nextMonth },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Next month');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}