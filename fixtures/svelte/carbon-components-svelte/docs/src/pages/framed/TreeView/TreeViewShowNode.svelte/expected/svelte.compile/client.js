import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

export default function TreeViewShowNode($$anchor) {
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

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			ButtonSet(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, () => [nodeSpark, nodeBlockchain], $.index, ($$anchor, $$item) => {
						let id = () => $.get($$item).id;
						let text = () => $.get($$item).text;

						Button($$anchor, {
							$$events: {
								click: () => {
									treeview?.showNode(id());
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, `Show "${text() ?? ''}"`));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					Button(node_2, {
						kind: 'tertiary',
						$$events: { click: () => treeview?.collapseAll() },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Collapse all');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var node_3 = $.child(div);

			$.bind_this(
				TreeView(node_3, {
					labelText: 'Cloud Products',
					get nodes() {
						return nodes;
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