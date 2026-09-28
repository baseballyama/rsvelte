import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DatePickerMonthProgrammatic($$anchor, $$props) {
	$.push($$props, true);

	let value = "03/2026";

	function previousMonth() {
		var [month, year] = value.split("/").map(Number);
		var d = new Date(year, month - 2, 1);
		var mm = String(d.getMonth() + 1).padStart(2, "0");

		value = `${mm}/${d.getFullYear()}`;
	}

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DatePicker(node, {
				datePickerType: 'month',
				dateFormat: 'm/Y',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				$$events: {
					change: function ($$arg) {
						$.bubble_event.call(this, $$props, $$arg);
					}
				},

				children: ($$anchor, $$slotProps) => {
					DatePickerInput($$anchor, { labelText: 'Billing month', placeholder: 'mm/yyyy' });
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Button(node_1, {
				$$events: { click: previousMonth },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Previous month');

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