import * as $ from 'svelte/internal/server';
import ToggleSkeleton from "carbon-components-svelte/Toggle/ToggleSkeleton.svelte";

export default function ToggleSkeleton_slot_test($$renderer) {
	ToggleSkeleton($$renderer, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}