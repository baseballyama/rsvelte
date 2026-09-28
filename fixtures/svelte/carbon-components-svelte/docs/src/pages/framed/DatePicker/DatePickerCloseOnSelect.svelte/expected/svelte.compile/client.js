import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerCloseOnSelect($$anchor) {
	DatePicker($$anchor, {
		datePickerType: 'single',
		flatpickrProps: { closeOnSelect: false },
		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
		},
		$$slots: { default: true }
	});
}