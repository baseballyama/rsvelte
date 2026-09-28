import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, filterTreeNodes, Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

export default function TreeViewFilterNodes($$anchor, $$props) {
	$.push($$props, true);

	const allNodes = [
		{
			id: "1",
			text: "Documents",
			nodes: [
				{
					id: "1-1",
					text: "Work",
					nodes: [
						{ id: "1-1-1", text: "Report.docx" },
						{ id: "1-1-2", text: "Presentation.pptx" },
						{ id: "1-1-3", text: "Budget.xlsx" }
					]
				},

				{
					id: "1-2",
					text: "Personal",
					nodes: [
						{ id: "1-2-1", text: "Resume.pdf" },
						{ id: "1-2-2", text: "Cover Letter.pdf" }
					]
				}
			]
		},

		{
			id: "2",
			text: "Pictures",
			nodes: [
				{ id: "2-1", text: "Vacation.jpg" },
				{ id: "2-2", text: "Family.jpg" }
			]
		},

		{
			id: "3",
			text: "Music",
			nodes: [
				{
					id: "3-1",
					text: "Rock",
					nodes: [
						{ id: "3-1-1", text: "Song1.mp3" },
						{ id: "3-1-2", text: "Song2.mp3" }
					]
				}
			]
		}
	];

	let filteredNodes = allNodes;
	let expandedIds = [];

	function filterByExtension() {
		filteredNodes = filterTreeNodes(allNodes, (node) => node.text?.endsWith(".pdf") || node.text?.endsWith(".docx"));
		expandedIds = ["1", "1-1", "1-1-1", "1-2", "1-2-1"];
	}

	function filterLeafNodes() {
		filteredNodes = filterTreeNodes(allNodes, (node) => !node.nodes || node.nodes.length === 0);

		expandedIds = [
			"1",
			"1-1",
			"1-1-1",
			"1-1-2",
			"1-1-3",
			"1-2",
			"1-2-1",
			"1-2-2",
			"2",
			"2-1",
			"2-2",
			"3",
			"3-1",
			"3-1-1",
			"3-1-2"
		];
	}

	function filterWithChildren() {
		filteredNodes = filterTreeNodes(allNodes, (node) => node.id === "1-1", { includeChildren: true });
		expandedIds = ["1", "1-1", "1-1-1", "1-1-2", "1-1-3"];
	}

	function resetFilter() {
		filteredNodes = allNodes;
		expandedIds = [];
	}

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
						size: 'small',
						$$events: { click: filterByExtension },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Filter by extension (.pdf, .docx)');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						size: 'small',
						$$events: { click: filterLeafNodes },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Filter leaf nodes');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						size: 'small',
						$$events: { click: filterWithChildren },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Filter with children');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						size: 'small',
						kind: 'tertiary',
						$$events: { click: resetFilter },
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

			var div = $.sibling(node_1, 2);
			var node_6 = $.child(div);

			TreeView(node_6, {
				labelText: 'File System',
				get nodes() {
					return filteredNodes;
				},

				get expandedIds() {
					return expandedIds;
				}
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}