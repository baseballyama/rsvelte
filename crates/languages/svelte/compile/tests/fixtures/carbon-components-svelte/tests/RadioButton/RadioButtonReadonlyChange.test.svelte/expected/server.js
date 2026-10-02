import * as $ from 'svelte/internal/server';
import RadioButton from "carbon-components-svelte/RadioButton/RadioButton.svelte";
import RadioButtonGroup from "carbon-components-svelte/RadioButtonGroup/RadioButtonGroup.svelte";

export default function RadioButtonReadonlyChange_test($$renderer) {
	RadioButtonGroup($$renderer, {
		legendText: 'Plan',
		readonly: true,
		selected: '1',
		children: ($$renderer) => {
			RadioButton($$renderer, { labelText: 'Free', value: '1' });
			$$renderer.push(`<!----> `);
			RadioButton($$renderer, { labelText: 'Pro', value: '2' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}