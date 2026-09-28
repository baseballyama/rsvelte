import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div> </div> <div> </div> <div> </div>`, 1);
var root_2 = $.from_html(`<!> <div><!></div> <!>`, 1);

export default function TreeViewAutoCollapse($$anchor) {
	let activeId = "";
	let selectedIds = [];
	let expandedIds = [];

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
			nodes: [{ id: 15, text: "IBM API Connect" }]
		}
	];

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			ButtonSet(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Button(node_1, {
						size: 'small',
						$$events: { click: () => activeId = 3 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Select Spark');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Button(node_2, {
						size: 'small',
						$$events: { click: () => activeId = 8 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Select Blockchain');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						size: 'small',
						$$events: { click: () => activeId = 12 },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Select MongoDB');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var div = $.sibling(node, 2);
			var node_4 = $.child(div);

			TreeView(node_4, {
				labelText: 'Cloud Products',
				get nodes() {
					return nodes;
				},
				autoCollapse: true,
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
				},

				$$events: {
					select: ({ detail }) => console.log("select", detail),
					toggle: ({ detail }) => console.log("toggle", detail),
					focus: ({ detail }) => console.log("focus", detail)
				}
			});

			$.reset(div);

			var node_5 = $.sibling(div, 2);

			Stack(node_5, {
				gap: 4,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var div_1 = $.first_child(fragment_3);
					var text_3 = $.only_child(div_1);
					var div_2 = $.sibling(div_1, 2);
					var text_4 = $.only_child(div_2);
					var div_3 = $.sibling(div_2, 2);
					var text_5 = $.only_child(div_3);

					$.template_effect(
						($0, $1) => {
							$.set_text(text_3, `Active node id: ${activeId ?? ''}`);
							$.set_text(text_4, `Selected ids: ${$0 ?? ''}`);
							$.set_text(text_5, `Expanded ids: ${$1 ?? ''}`);
						},
						[
							() => JSON.stringify(selectedIds),
							() => JSON.stringify(expandedIds)
						]
					);

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}