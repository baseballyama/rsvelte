import * as $ from 'svelte/internal/server';
import Select from "carbon-components-svelte/Select/Select.svelte";
import SelectItem from "carbon-components-svelte/Select/SelectItem.svelte";

export default function Select_slot_test($$renderer) {
	Select($$renderer, {
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