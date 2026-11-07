import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function ComboBox_slot_test($$anchor) {
	const items = [{ id: "0", text: "Option 1" }, { id: "1", text: "Option 2" }];

	ComboBox($$anchor, {
		get items() {
			return items;
		},
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}