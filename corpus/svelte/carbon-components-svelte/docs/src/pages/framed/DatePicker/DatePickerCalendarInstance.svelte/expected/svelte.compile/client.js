import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DatePickerCalendarInstance($$anchor, $$props) {
	let calendar = null;
	let weekendsDisabled = false;

	function openCalendar(e) {
		// Prevent the click from bubbling to the outside click
		// handler and closing the calendar immediately.
		e.stopPropagation();

		calendar?.open();
	}

	function toggleWeekends() {
		weekendsDisabled = !weekendsDisabled;

		calendar?.set("disable", weekendsDisabled
			? [(date) => date.getDay() === 0 || date.getDay() === 6]
			: []);
	}

	Stack($$anchor, {
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DatePicker(node, {
				datePickerType: 'single',
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
					DatePickerInput($$anchor, { labelText: 'Appointment', placeholder: 'mm/dd/yyyy' });
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
						$$events: { click: openCalendar },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Open calendar');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						kind: 'tertiary',
						$$events: { click: toggleWeekends },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, `${weekendsDisabled ? "Enable" : "Disable"}
      weekends`));

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
}