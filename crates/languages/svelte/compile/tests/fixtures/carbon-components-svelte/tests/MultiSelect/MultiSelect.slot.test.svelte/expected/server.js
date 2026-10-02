import * as $ from 'svelte/internal/server';
import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

export default function MultiSelect_slot_test($$renderer) {
	const items = [{ id: "0", text: "Option 1" }, { id: "1", text: "Option 2" }];

	MultiSelect($$renderer, {
		items,
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}