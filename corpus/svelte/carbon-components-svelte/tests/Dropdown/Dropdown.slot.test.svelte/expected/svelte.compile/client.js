import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function Dropdown_slot_test($$anchor) {
	const items = [{ id: "0", text: "Option 1" }, { id: "1", text: "Option 2" }];

	Dropdown($$anchor, {
		get items() {
			return items;
		},
		selectedId: '0',
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}