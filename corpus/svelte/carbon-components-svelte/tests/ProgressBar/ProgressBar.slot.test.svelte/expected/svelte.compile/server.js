import * as $ from 'svelte/internal/server';
import ProgressBar from "carbon-components-svelte/ProgressBar/ProgressBar.svelte";

export default function ProgressBar_slot_test($$renderer) {
	ProgressBar($$renderer, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}