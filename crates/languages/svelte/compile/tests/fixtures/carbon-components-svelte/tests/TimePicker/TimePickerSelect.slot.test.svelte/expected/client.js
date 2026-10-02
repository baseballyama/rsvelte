import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SelectItem from "carbon-components-svelte/Select/SelectItem.svelte";
import TimePickerSelect from "carbon-components-svelte/TimePicker/TimePickerSelect.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function TimePickerSelect_slot_test($$anchor) {
	TimePickerSelect($$anchor, {
		labelText: 'Default label',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SelectItem(node, { value: 'option1', text: 'Option 1' });

			var node_1 = $.sibling(node, 2);

			SelectItem(node_1, { value: 'option2', text: 'Option 2' });
			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root_1();

				$.append($$anchor, span);
			}
		}
	});
}