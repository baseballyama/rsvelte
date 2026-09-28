import * as $ from 'svelte/internal/server';
import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";
import CheckboxGroup from "carbon-components-svelte/Checkbox/CheckboxGroup.svelte";

export default function CheckboxReadonlyChange_test($$renderer) {
	CheckboxGroup($$renderer, {
		legendText: 'Options',
		readonly: true,
		selected: ["1"],
		children: ($$renderer) => {
			Checkbox($$renderer, { labelText: 'Option 1', value: '1' });
			$$renderer.push(`<!----> `);
			Checkbox($$renderer, { labelText: 'Option 2', value: '2' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}