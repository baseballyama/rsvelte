import * as $ from 'svelte/internal/server';
import TreeView from "carbon-components-svelte/TreeView/TreeView.svelte";

export default function TreeView_slot_test($$renderer) {
	const nodes = [{ id: 0, text: "Node 1" }, { id: 1, text: "Node 2" }];

	TreeView($$renderer, {
		nodes,
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}