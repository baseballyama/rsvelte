import * as $ from 'svelte/internal/server';
import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";

export default function ComboBox_slot_test($$renderer) {
	const items = [{ id: "0", text: "Option 1" }, { id: "1", text: "Option 2" }];

	ComboBox($$renderer, {
		items,
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}