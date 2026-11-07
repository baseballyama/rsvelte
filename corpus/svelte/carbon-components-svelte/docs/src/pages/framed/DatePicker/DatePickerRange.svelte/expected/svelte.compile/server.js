import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerRange($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'range',
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Start date', placeholder: 'mm/dd/yyyy' });
			$$renderer.push(`<!----> `);
			DatePickerInput($$renderer, { labelText: 'End date', placeholder: 'mm/dd/yyyy' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}