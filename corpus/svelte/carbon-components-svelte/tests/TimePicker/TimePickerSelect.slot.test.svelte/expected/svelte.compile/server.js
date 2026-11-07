import * as $ from 'svelte/internal/server';
import SelectItem from "carbon-components-svelte/Select/SelectItem.svelte";
import TimePickerSelect from "carbon-components-svelte/TimePicker/TimePickerSelect.svelte";

export default function TimePickerSelect_slot_test($$renderer) {
	TimePickerSelect($$renderer, {
		labelText: 'Default label',
		children: ($$renderer) => {
			SelectItem($$renderer, { value: 'option1', text: 'Option 1' });
			$$renderer.push(`<!----> `);
			SelectItem($$renderer, { value: 'option2', text: 'Option 2' });
			$$renderer.push(`<!---->`);
		},

		$$slots: {
			default: true,
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}