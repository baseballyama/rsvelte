import * as $ from 'svelte/internal/server';
import DatePicker from "carbon-components-svelte/DatePicker/DatePicker.svelte";
import DatePickerInput from "carbon-components-svelte/DatePicker/DatePickerInput.svelte";
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";

export default function DatePicker_fluidForm_test($$renderer) {
	FluidForm($$renderer, {
		children: ($$renderer) => {
			DatePicker($$renderer, {
				datePickerType: 'single',
				children: ($$renderer) => {
					DatePickerInput($$renderer, { labelText: 'Date', placeholder: 'mm/dd/yyyy' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}