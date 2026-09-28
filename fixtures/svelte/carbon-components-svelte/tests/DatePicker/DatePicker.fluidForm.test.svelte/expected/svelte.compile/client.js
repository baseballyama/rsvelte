import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DatePicker from "carbon-components-svelte/DatePicker/DatePicker.svelte";
import DatePickerInput from "carbon-components-svelte/DatePicker/DatePickerInput.svelte";
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";

export default function DatePicker_fluidForm_test($$anchor) {
	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, {
				datePickerType: 'single',
				children: ($$anchor, $$slotProps) => {
					DatePickerInput($$anchor, { labelText: 'Date', placeholder: 'mm/dd/yyyy' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}