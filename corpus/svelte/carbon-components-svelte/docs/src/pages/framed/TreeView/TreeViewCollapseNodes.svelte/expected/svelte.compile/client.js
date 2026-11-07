import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

export default function TreeViewCollapseNodes($$anchor) {
	let treeview = null;
	let expandedIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 14];

	let nodes = [
		{ id: 0, text: "AI / Machine learning" },
		{
			id: 1,
			text: "Analytics",
			disabled: true,
			nodes: [
				{
					id: 2,
					text: "IBM Analytics Engine",
					disabled: true,
					nodes: [
						{ id: 3, text: "Apache Spark", disabled: true },
						{ id: 4, text: "Hadoop", disabled: true }
					]
				},
				{ id: 5, text: "IBM Cloud SQL Query", disabled: true },
				{ id: 6, text: "IBM Db2 Warehouse on Cloud", disabled: true }
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

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			ButtonSet(node_1, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Button(node_2, {
						$$events: {
							click: () => {
								treeview?.collapseNodes();
							}
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Collapse all nodes');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						$$events: {
							click: () => {
								treeview?.expandNodes();
								treeview?.collapseNodes((node) => node.disabled);
							}
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Collapse disabled nodes');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node_1, 2);
			var node_4 = $.child(div);

			$.bind_this(
				TreeView(node_4, {
					labelText: 'Cloud Products',
					get nodes() {
						return nodes;
					},

					get expandedIds() {
						return expandedIds;
					},

					set expandedIds($$value) {
						expandedIds = $$value;
					}
				}),
				($$value) => treeview = $$value,
				() => treeview
			);

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}