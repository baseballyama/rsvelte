import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, Stack, TreeView } from "carbon-components-svelte";

export default function TreeViewShowNodeOptions($$renderer) {
	const targetNode = { id: 3, text: "Apache Spark" };
	const targetNodeSelect = { id: 0, text: "AI / Machine learning" };
	let treeview = null;
	let key = 0;

	let nodes = [
		targetNodeSelect,
		{
			id: 1,
			text: "Analytics",
			nodes: [
				{
					id: 2,
					text: "IBM Analytics Engine",
					nodes: [targetNode, { id: 4, text: "Hadoop" }]
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
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Default (expand + select + focus)`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Expand only`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select only`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						kind: 'tertiary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Reset`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div><!---->`);

			{
				TreeView($$renderer, { labelText: 'Cloud Products', nodes });
			}

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}