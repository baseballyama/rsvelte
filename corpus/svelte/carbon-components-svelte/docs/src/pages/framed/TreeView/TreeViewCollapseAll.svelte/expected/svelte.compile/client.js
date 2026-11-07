import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<div><!></div> <div><!></div>`, 1);

export default function TreeViewCollapseAll($$anchor) {
	let treeview = null;
	let expandedIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

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

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Button(node, {
				$$events: {
					click: function (...$$args) {
						(treeview?.collapseAll)?.apply(this, $$args);
					}
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Collapse all');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var node_1 = $.child(div_1);

			$.bind_this(
				TreeView(node_1, {
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

			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}