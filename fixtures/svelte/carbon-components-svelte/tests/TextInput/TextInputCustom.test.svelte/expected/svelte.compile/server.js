import * as $ from 'svelte/internal/server';
import TextInput from "carbon-components-svelte/TextInput/TextInput.svelte";

export default function TextInputCustom_test($$renderer) {
	TextInput($$renderer, {
		labelText: 'Custom label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom Label Text</span>`);
			}
		}
	});
}