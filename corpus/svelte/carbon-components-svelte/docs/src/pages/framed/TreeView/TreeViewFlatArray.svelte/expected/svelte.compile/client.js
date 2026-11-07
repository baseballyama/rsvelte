import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stack, TreeView, toHierarchy } from "carbon-components-svelte";
import Analytics from "carbon-icons-svelte/lib/Analytics.svelte";

var root = $.from_html(`<div><!></div>`);

export default function TreeViewFlatArray($$anchor, $$props) {
	$.push($$props, true);

	let nodesFlat = [
		{ id: 0, text: "AI / Machine learning", icon: Analytics },
		{ id: 1, text: "Analytics" },
		{ id: 2, text: "IBM Analytics Engine", pid: 1 },
		{ id: 3, text: "Apache Spark", pid: 2 },
		{ id: 4, text: "Hadoop", pid: 2 },
		{ id: 5, text: "IBM Cloud SQL Query", pid: 1 },
		{ id: 6, text: "IBM Db2 Warehouse on Cloud", pid: 1 },
		{ id: 7, text: "Blockchain" },
		{ id: 8, text: "IBM Blockchain Platform", pid: 7 },
		{ id: 9, text: "Databases" },
		{
			id: 10,
			text: "IBM Cloud Databases for Elasticsearch",
			pid: 9
		},

		{
			id: 11,
			text: "IBM Cloud Databases for Enterprise DB",
			pid: 9
		},
		{ id: 12, text: "IBM Cloud Databases for MongoDB", pid: 9 },
		{ id: 13, text: "IBM Cloud Databases for PostgreSQL", pid: 9 },
		{ id: 14, text: "Integration", disabled: true },
		{ id: 15, text: "IBM API Connect", disabled: true, pid: 14 }
	];

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_1 = $.child(div);

			{
				let $0 = $.derived(() => toHierarchy(nodesFlat, (node) => node.pid));

				TreeView(node_1, {
					labelText: 'Cloud Products',
					get nodes() {
						return $.get($0);
					}
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}