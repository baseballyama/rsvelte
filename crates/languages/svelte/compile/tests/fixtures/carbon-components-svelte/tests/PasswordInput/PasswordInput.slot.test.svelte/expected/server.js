import * as $ from 'svelte/internal/server';
import PasswordInput from "carbon-components-svelte/TextInput/PasswordInput.svelte";

export default function PasswordInput_slot_test($$renderer) {
	PasswordInput($$renderer, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}