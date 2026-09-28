import * as $ from 'svelte/internal/server';
import NumberInput from "carbon-components-svelte/NumberInput/NumberInput.svelte";

export default function NumberInputCustom_test($$renderer) {
	NumberInput($$renderer, {
		labelText: 'Custom label',
		value: 0,
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom Label Text</span>`);
			}
		}
	});
}