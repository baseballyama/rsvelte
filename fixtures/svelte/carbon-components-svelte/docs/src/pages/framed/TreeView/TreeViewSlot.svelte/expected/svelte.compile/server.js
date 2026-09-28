import * as $ from 'svelte/internal/server';
import { Stack, TreeView } from "carbon-components-svelte";

export default function TreeViewSlot($$renderer) {
	let activeId = 0;
	let selectedIds = [0, 7, 9];

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

	Stack($$renderer, {
		gap: 6,
		children: ($$renderer) => {
			$$renderer.push(`<div>`);

			TreeView($$renderer, {
				labelText: 'Cloud Products',
				activeId,
				selectedIds,
				nodes,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { node }) => {
						$$renderer.push(`<span${$.attr_style('', {
							color: node.selected ? "var(--cds-interactive-04)" : "inherit",
							'text-decoration': node.disabled ? "inherit" : "underline"
						})}>${$.escape(node.text)}
        (id: ${$.escape(node.id)})</span>`);
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}