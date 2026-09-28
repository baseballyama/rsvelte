import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import RadioButton from "carbon-components-svelte/RadioButton/RadioButton.svelte";
import RadioButtonGroup from "carbon-components-svelte/RadioButtonGroup/RadioButtonGroup.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function RadioButtonReadonlyChange_test($$anchor) {
	RadioButtonGroup($$anchor, {
		legendText: 'Plan',
		readonly: true,
		selected: '1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			RadioButton(node, { labelText: 'Free', value: '1' });

			var node_1 = $.sibling(node, 2);

			RadioButton(node_1, {
				labelText: 'Pro',
				value: '2',
				$$events: { change: () => console.log("radio-change", "2") }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}