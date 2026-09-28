import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<div> </div> <div> </div>`, 1);
var root_1 = $.from_html(`<div><!></div> <!>`, 1);

export default function TreeViewMultiselectNode($$anchor) {
	let activeId = 0;
	let selectedIds = [0];
	let expandedIds = [1];

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

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			TreeView(node, {
				multiselect: true,
				multiselectMode: 'node',
				labelText: 'Cloud Products (node scope)',
				get nodes() {
					return nodes;
				},

				get activeId() {
					return activeId;
				},

				set activeId($$value) {
					activeId = $$value;
				},

				get selectedIds() {
					return selectedIds;
				},

				set selectedIds($$value) {
					selectedIds = $$value;
				},

				get expandedIds() {
					return expandedIds;
				},

				set expandedIds($$value) {
					expandedIds = $$value;
				}
			});

			$.reset(div);

			var node_1 = $.sibling(div, 2);

			Stack(node_1, {
				gap: 4,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var div_1 = $.first_child(fragment_2);
					var text = $.only_child(div_1);
					var div_2 = $.sibling(div_1, 2);
					var text_1 = $.only_child(div_2);

					$.template_effect(
						($0) => {
							$.set_text(text, `Active node id: ${activeId ?? ''}`);
							$.set_text(text_1, `Selected ids: ${$0 ?? ''}`);
						},
						[() => JSON.stringify(selectedIds)]
					);

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}