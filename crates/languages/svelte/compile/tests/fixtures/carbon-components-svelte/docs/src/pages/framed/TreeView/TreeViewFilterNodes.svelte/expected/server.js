import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, filterTreeNodes, Stack, TreeView } from "carbon-components-svelte";

export default function TreeViewFilterNodes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				ButtonSet($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Filter by extension (.pdf, .docx)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Filter leaf nodes`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Filter with children`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							size: 'small',
							kind: 'tertiary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Reset`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div>`);
				TreeView($$renderer, { labelText: 'File System', nodes: filteredNodes, expandedIds });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	});
}