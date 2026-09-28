import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerSingle($$anchor, $$props) {
	DatePicker($$anchor, {
		datePickerType: 'single',
		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});
}