import * as $ from 'svelte/internal/server';
import { Stack, TreeView } from "carbon-components-svelte";

export default function TreeViewActive($$renderer) {
	let activeId = 0;
	let selectedIds = [];

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
		},

		{
			id: 9,
			text: "Databases",
			nodes: [
				{ id: 10, text: "IBM Cloud Databases for Elasticsearch" },
				{ id: 11, text: "IBM Cloud Databases for Enterprise DB" },
				{ id: 12, text: "IBM Cloud Databases for MongoDB" },
				{ id: 13, text: "IBM Cloud Databases for PostgreSQL" }
			]
		},

		{
			id: 14,
			text: "Integration",
			disabled: true,
			nodes: [{ id: 15, text: "IBM API Connect", disabled: true }]
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
					labelText: 'Cloud Products',
					nodes,
					get activeId() {
						return activeId;
					},

					set activeId($$value) {
						activeId = $$value;
						$$settled = false;
					},

					get selectedIds() {
						return selectedIds;
					},

					set selectedIds($$value) {
						selectedIds = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> `);

				Stack($$renderer, {
					gap: 4,
					children: ($$renderer) => {
						$$renderer.push(`<div>Active node id: ${$.escape(activeId)}</div> <div>Selected ids: ${$.escape(JSON.stringify(selectedIds))}</div>`);
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