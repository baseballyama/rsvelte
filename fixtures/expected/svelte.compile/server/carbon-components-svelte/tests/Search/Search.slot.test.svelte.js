import * as $ from 'svelte/internal/server';
import Search from "carbon-components-svelte/Search/Search.svelte";

export default function Search_slot_test($$renderer) {
	Search($$renderer, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}