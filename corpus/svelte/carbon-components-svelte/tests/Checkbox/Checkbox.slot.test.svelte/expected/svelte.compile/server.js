import * as $ from 'svelte/internal/server';
import Checkbox from "carbon-components-svelte/Checkbox/Checkbox.svelte";

export default function Checkbox_slot_test($$renderer) {
	Checkbox($$renderer, {
		'data-testid': 'checkbox-slot',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren" data-testid="custom-label">Custom label content</span>`);
			}
		}
	});
}