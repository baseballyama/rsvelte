import * as $ from 'svelte/internal/server';
import RadioButton from "carbon-components-svelte/RadioButton/RadioButton.svelte";

export default function RadioButtonCustom_test($$renderer) {
	RadioButton($$renderer, {
		labelText: 'Custom label',
		value: 'custom',
		name: 'test-group',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom Label Text</span>`);
			}
		}
	});
}