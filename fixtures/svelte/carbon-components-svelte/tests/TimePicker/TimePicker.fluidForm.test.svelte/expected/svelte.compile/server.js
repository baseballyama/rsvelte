import * as $ from 'svelte/internal/server';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import SelectItem from "carbon-components-svelte/Select/SelectItem.svelte";
import TimePicker from "carbon-components-svelte/TimePicker/TimePicker.svelte";
import TimePickerSelect from "carbon-components-svelte/TimePicker/TimePickerSelect.svelte";

export default function TimePicker_fluidForm_test($$renderer) {
	FluidForm($$renderer, {
		children: ($$renderer) => {
			TimePicker($$renderer, {
				labelText: 'Time',
				placeholder: 'hh:mm',
				children: ($$renderer) => {
					TimePickerSelect($$renderer, {
						labelText: 'Clock',
						value: 'am',
						children: ($$renderer) => {
							SelectItem($$renderer, { value: 'am', text: 'AM' });
							$$renderer.push(`<!----> `);
							SelectItem($$renderer, { value: 'pm', text: 'PM' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}