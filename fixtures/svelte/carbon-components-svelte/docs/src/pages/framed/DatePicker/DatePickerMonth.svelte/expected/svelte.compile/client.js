import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerMonth($$anchor, $$props) {
	DatePicker($$anchor, {
		datePickerType: 'month',
		dateFormat: 'F Y',
		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, { labelText: 'Billing month', placeholder: 'Month Year' });
		},
		$$slots: { default: true }
	});
}