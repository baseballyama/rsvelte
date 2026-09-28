import * as $ from 'svelte/internal/server';
import { Stack, TreeView } from "carbon-components-svelte";

export default function TreeViewCheckbox($$renderer) {
	let checkedIds = [3];
	let indeterminateIds = [];
	let expandedIds = [1, 2, 7];

	let nodes = [
		{ id: 0, text: "AI / Machine learning" },
		{
			id: 1,
			text: "Analytics",
			nodes: [
				{
					id: 2,
					text: "IBM Analytics Engine",
					nodes: [{ id: 3, text: "Apache Spark" }, { id: 4, text: "Hadoop" }]
				},
				{ id: 5, text: "IBM Cloud SQL Query" },
				{ id: 6, text: "IBM Db2 Warehouse on Cloud" }
			]
		},

		{
			id: 7,
			text: "Blockchain",
			nodes: [{ id: 8, text: "IBM Blockchain Platform" }]
		}
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				TreeView($$renderer, {
					selectionMode: 'checkbox',
					labelText: 'Cloud Products',
					nodes,
					get checkedIds() {
						return checkedIds;
					},

					set checkedIds($$value) {
						checkedIds = $$value;
						$$settled = false;
					},

					get indeterminateIds() {
						return indeterminateIds;
					},

					set indeterminateIds($$value) {
						indeterminateIds = $$value;
						$$settled = false;
					},

					get expandedIds() {
						return expandedIds;
					},

					set expandedIds($$value) {
						expandedIds = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> `);

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						$$renderer.push(`<div>Checked ids: ${$.escape(JSON.stringify(checkedIds))}</div> <div>Indeterminate ids: ${$.escape(JSON.stringify(indeterminateIds))}</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}