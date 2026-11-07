import * as $ from 'svelte/internal/server';
import Button from "carbon-components-svelte/Button/Button.svelte";
import TreeView from "carbon-components-svelte/TreeView/TreeView.svelte";

export default function TreeView_showNode_idEscape_test($$renderer) {
	/** Id contains `"`, which breaks a naive `[id="..."]` selector without CSS.escape */
	const targetId = 'node-with-"-char';

	let treeview;

	let nodes = [
		{
			id: "folder",
			text: "Folder",
			nodes: [{ id: targetId, text: "Leaf" }]
		}
	];

	TreeView($$renderer, {
		labelText: 'showNode id escape',
		nodes,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { node }) => {
				$$renderer.push(`<!---->${$.escape(node.text)}`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		'data-testid': 'show-special-id',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Show node with special id`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}