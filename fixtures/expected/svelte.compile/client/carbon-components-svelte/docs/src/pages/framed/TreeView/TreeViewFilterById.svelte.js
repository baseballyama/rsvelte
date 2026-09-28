import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, filterTreeById, Stack, TreeView } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <div><!></div>`, 1);

export default function TreeViewFilterById($$anchor, $$props) {
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

	function filterBySingleId() {
		filteredNodes = filterTreeById(allNodes, "1-1-1");
		expandedIds = ["1", "1-1", "1-1-1"];
	}

	function filterByMultipleIds() {
		filteredNodes = filterTreeById(allNodes, ["1-1-1", "1-2-1", "2-1"]);
		expandedIds = ["1", "1-1", "1-1-1", "1-2", "1-2-1", "2", "2-1"];
	}

	function resetFilter() {
		filteredNodes = allNodes;
		expandedIds = [];
	}

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
						size: 'small',
						$$events: { click: filterBySingleId },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Filter single ID');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Button(node_2, {
						size: 'small',
						$$events: { click: filterByMultipleIds },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Filter multiple IDs');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						size: 'small',
						kind: 'tertiary',
						$$events: { click: resetFilter },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Reset');

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