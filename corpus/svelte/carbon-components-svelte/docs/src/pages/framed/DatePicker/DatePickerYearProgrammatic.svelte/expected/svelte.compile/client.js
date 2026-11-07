import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DatePickerYearProgrammatic($$anchor, $$props) {
	$.push($$props, true);

	let value = "";
	let calendar = null;

	function selectCurrentYear() {
		value = String(new Date().getFullYear());
	}

	function viewNextDecade() {
		calendar?.changeYear(calendar.currentYear + 10);
	}

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DatePicker(node, {
				datePickerType: 'year',
				dateFormat: 'Y',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				get calendar() {
					return calendar;
				},

				set calendar($$value) {
					calendar = $$value;
				},

				$$events: {
					change: function ($$arg) {
						$.bubble_event.call(this, $$props, $$arg);
					}
				},

				children: ($$anchor, $$slotProps) => {
					DatePickerInput($$anchor, { labelText: 'Fiscal year', placeholder: 'yyyy' });
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Stack(node_1, {
				gap: 3,
				orientation: 'horizontal',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_2 = $.first_child(fragment_3);

					Button(node_2, {
						kind: 'tertiary',
						$$events: { click: selectCurrentYear },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Select current year');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						kind: 'tertiary',
						$$events: { click: viewNextDecade },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('View next decade');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}