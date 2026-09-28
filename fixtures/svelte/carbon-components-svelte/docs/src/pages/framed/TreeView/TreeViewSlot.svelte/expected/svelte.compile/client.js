import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function TreeViewSlot($$anchor) {
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

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node_1 = $.child(div);

			TreeView(node_1, {
				labelText: 'Cloud Products',
				activeId,
				get selectedIds() {
					return selectedIds;
				},

				get nodes() {
					return nodes;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const node = $.derived(() => $$slotProps.node);
						var span = root();
						let styles;
						var text = $.only_child(span);

						$.template_effect(() => {
							styles = $.set_style(span, '', styles, {
								color: $.get(node).selected ? "var(--cds-interactive-04)" : "inherit",
								'text-decoration': $.get(node).disabled ? "inherit" : "underline"
							});

							$.set_text(text, `${$.get(node).text ?? ''}
        (id: ${$.get(node).id ?? ''})`);
						});

						$.append($$anchor, span);
					}
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}