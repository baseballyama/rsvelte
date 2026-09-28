import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import Select from "carbon-components-svelte/Select/Select.svelte";
import SelectItem from "carbon-components-svelte/Select/SelectItem.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Select_fluidForm_test($$anchor) {
	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Select($$anchor, {
				labelText: 'Fluid form select',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					SelectItem(node, { value: 'option-1', text: 'Option 1' });

					var node_1 = $.sibling(node, 2);

					SelectItem(node_1, { value: 'option-2', text: 'Option 2' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}