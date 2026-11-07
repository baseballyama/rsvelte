import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

export default function TreeViewShowNodeOptions($$anchor) {
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

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			ButtonSet(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Button(node_1, {
						$$events: {
							click: () => {
								treeview?.showNode(targetNode.id);
							}
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Default (expand + select + focus)');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Button(node_2, {
						$$events: {
							click: () => {
								treeview?.showNode(targetNode.id, { select: false, focus: false });
							}
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Expand only');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						$$events: {
							click: () => {
								treeview?.showNode(targetNodeSelect.id, { expand: false, focus: false });
							}
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Select only');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						kind: 'tertiary',
						$$events: { click: () => key++ },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Reset');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var node_5 = $.child(div);

			$.key(node_5, () => key, ($$anchor) => {
				$.bind_this(
					TreeView($$anchor, {
						labelText: 'Cloud Products',
						get nodes() {
							return nodes;
						}
					}),
					($$value) => treeview = $$value,
					() => treeview
				);
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}