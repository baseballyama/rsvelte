import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerMonthCustomFormat($$anchor, $$props) {
	DatePicker($$anchor, {
		datePickerType: 'month',
		dateFormat: 'Y-m',
		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, { labelText: 'Billing month', placeholder: 'yyyy-mm' });
		},
		$$slots: { default: true }
	});
}