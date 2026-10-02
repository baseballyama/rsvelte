import * as $ from 'svelte/internal/server';
import TreeView from "carbon-components-svelte/TreeView/TreeView.svelte";

export default function TreeViewDuplicateIds_test($$renderer) {
	const nodes = [
		{
			id: 0,
			text: "Parent",
			nodes: [{ id: 1, text: "Child A" }, { id: 2, text: "Child B" }]
		}
	];

	TreeView($$renderer, {
		labelText: 'First',
		nodes,
		expandedIds: [0],
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { node }) => {
				$$renderer.push(`<!---->${$.escape(node.text)}`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	TreeView($$renderer, {
		labelText: 'Second',
		nodes,
		expandedIds: [0],
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { node }) => {
				$$renderer.push(`<!---->${$.escape(node.text)}`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}