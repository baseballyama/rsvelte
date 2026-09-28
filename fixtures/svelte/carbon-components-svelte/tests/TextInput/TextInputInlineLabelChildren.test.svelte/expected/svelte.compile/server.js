import * as $ from 'svelte/internal/server';
import TextInput from "carbon-components-svelte/TextInput/TextInput.svelte";

export default function TextInputInlineLabelChildren_test($$renderer) {
	TextInput($$renderer, {
		inline: true,
		labelText: '',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Inline Slot Label</span>`);
			}
		}
	});
}