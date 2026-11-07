import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TreeView from "carbon-components-svelte/TreeView/TreeView.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function TreeView_slot_test($$anchor) {
	const nodes = [{ id: 0, text: "Node 1" }, { id: 1, text: "Node 2" }];

	TreeView($$anchor, {
		get nodes() {
			return nodes;
		},
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}