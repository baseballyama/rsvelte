import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, Stack, TreeView } from "carbon-components-svelte";

export default function TreeViewShowNode($$renderer) {
	const nodeSpark = { id: 3, text: "Apache Spark" };
	const nodeBlockchain = { id: 8, text: "IBM Blockchain Platform" };
	let treeview = null;

	let nodes = [
		{ id: 0, text: "AI / Machine learning" },
		{
			id: 1,
			text: "Analytics",
			nodes: [
				{
					id: 2,
					text: "IBM Analytics Engine",
					nodes: [nodeSpark, { id: 4, text: "Hadoop" }]
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

	Stack($$renderer, {
		gap: 6,
		children: ($$renderer) => {
			ButtonSet($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like([nodeSpark, nodeBlockchain]);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let { id, text } = each_array[$$index];

						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Show "${$.escape(text)}"`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--> `);

					Button($$renderer, {
						kind: 'tertiary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Collapse all`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div>`);
			TreeView($$renderer, { labelText: 'Cloud Products', nodes });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}