import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerMinMax($$anchor, $$props) {
	$.push($$props, true);

	const start = new Date(2025, 0, 1);
	const end = new Date(2025, 11, 31);

	DatePicker($$anchor, {
		datePickerType: 'single',
		get minDate() {
			return start;
		},

		get maxDate() {
			return end;
		},

		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, { labelText: 'Date (2025 only)', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});

	$.pop();
}