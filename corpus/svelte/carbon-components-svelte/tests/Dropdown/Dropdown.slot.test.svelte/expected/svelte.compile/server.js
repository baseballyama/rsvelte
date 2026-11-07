import * as $ from 'svelte/internal/server';
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";

export default function Dropdown_slot_test($$renderer) {
	const items = [{ id: "0", text: "Option 1" }, { id: "1", text: "Option 2" }];

	Dropdown($$renderer, {
		items,
		selectedId: '0',
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}