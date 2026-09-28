import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<div> </div> <div> </div>`, 1);
var root_1 = $.from_html(`<div><!></div> <!>`, 1);

export default function TreeViewCheckbox($$anchor) {
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

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			TreeView(node, {
				selectionMode: 'checkbox',
				labelText: 'Cloud Products',
				get nodes() {
					return nodes;
				},

				get checkedIds() {
					return checkedIds;
				},

				set checkedIds($$value) {
					checkedIds = $$value;
				},

				get indeterminateIds() {
					return indeterminateIds;
				},

				set indeterminateIds($$value) {
					indeterminateIds = $$value;
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
						($0, $1) => {
							$.set_text(text, `Checked ids: ${$0 ?? ''}`);
							$.set_text(text_1, `Indeterminate ids: ${$1 ?? ''}`);
						},
						[
							() => JSON.stringify(checkedIds),
							() => JSON.stringify(indeterminateIds)
						]
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