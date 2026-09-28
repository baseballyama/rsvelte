import * as $ from 'svelte/internal/server';
import Button from "carbon-components-svelte/Button/Button.svelte";
import TreeView from "carbon-components-svelte/TreeView/TreeView.svelte";

export default function TreeView_getNode_test($$renderer) {
	let treeview;
	let selectedIds = [];

	let nodes = [
		{ id: 0, text: "Level 0" },
		{
			id: 1,
			text: "Level 1",
			nodes: [
				{
					id: 2,
					text: "Level 2",
					nodes: [
						{ id: 3, text: "Level 3 - Target" },
						{ id: 4, text: "Level 3 - Other" }
					]
				}
			]
		}
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TreeView($$renderer, {
			labelText: 'getNode Test',
			nodes,
			get selectedIds() {
				return selectedIds;
			},

			set selectedIds($$value) {
				selectedIds = $$value;
				$$settled = false;
			},
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { node }) => {
					$$renderer.push(`<!---->${$.escape(node.text)}`);
				}
			}
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			'data-testid': 'get-node',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Get node`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			'data-testid': 'get-missing-node',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Get missing node`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			'data-testid': 'get-nodes',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Get nodes`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}