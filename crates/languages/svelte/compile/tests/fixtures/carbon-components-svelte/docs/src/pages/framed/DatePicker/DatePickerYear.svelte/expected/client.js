import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerYear($$anchor, $$props) {
	DatePicker($$anchor, {
		datePickerType: 'year',
		dateFormat: 'Y',
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
}