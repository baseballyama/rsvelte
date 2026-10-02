import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";
import CheckboxGroup from "carbon-components-svelte/Checkbox/CheckboxGroup.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function CheckboxReadonlyChange_test($$anchor) {
	CheckboxGroup($$anchor, {
		legendText: 'Options',
		readonly: true,
		selected: ["1"],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Checkbox(node, { labelText: 'Option 1', value: '1' });

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, {
				labelText: 'Option 2',
				value: '2',
				$$events: { change: () => console.log("checkbox-change", "2") }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}