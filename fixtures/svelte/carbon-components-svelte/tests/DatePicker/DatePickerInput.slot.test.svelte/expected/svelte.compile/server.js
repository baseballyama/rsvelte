import * as $ from 'svelte/internal/server';
import DatePicker from "carbon-components-svelte/DatePicker/DatePicker.svelte";
import DatePickerInput from "carbon-components-svelte/DatePicker/DatePickerInput.svelte";

export default function DatePickerInput_slot_test($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'simple',
		children: ($$renderer) => {
			DatePickerInput($$renderer, {
				labelText: 'Default label',
				$$slots: {
					labelChildren: ($$renderer) => {
						$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
					}
				}
			});
		},
		$$slots: { default: true }
	});
}