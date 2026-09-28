import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, ContentSwitcher, Stack, Switch, TreeView } from "carbon-components-svelte";
import { tick } from "svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div> </div> <div> </div> <div> </div>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <div><!></div>`, 1);

export default function TreeViewPerformance($$anchor, $$props) {
	$.push($$props, true);

	let treeview = null;
	let performanceInfo = { expandAll: 0, collapseAll: 0, showNode: 0 };

	function generateLargeTree() {
		const nodes = [];
		let idCounter = 0;

		for (let i = 0; i < 10; i++) {
			const categoryNodes = [];

			for (let j = 0; j < 10; j++) {
				const subcategoryNodes = [];

				for (let k = 0; k < 10; k++) {
					subcategoryNodes.push({ id: idCounter++, text: `Item ${i}-${j}-${k}` });
				}

				categoryNodes.push({
					id: idCounter++,
					text: `Subcategory ${i}-${j}`,
					nodes: subcategoryNodes
				});
			}

			nodes.push({ id: idCounter++, text: `Category ${i}`, nodes: categoryNodes });
		}

		return nodes;
	}

	function generateDeepTree() {
		let idCounter = 0;
		let lastId = 0;

		function createNestedNode(depth, maxDepth) {
			const node = { id: idCounter++, text: `Level ${depth}` };

			lastId = node.id;

			if (depth < maxDepth) {
				node.nodes = [createNestedNode(depth + 1, maxDepth)];
			}

			return node;
		}

		const rootNode = createNestedNode(0, 100);

		return { nodes: [rootNode], lastId };
	}

	let nodes = generateLargeTree();
	let treeType = "large";
	let lastDeepNodeId = null;
	let selectedIndex = 0;

	async function handleTreeSwitch(event) {
		const index = event.detail;

		selectedIndex = index;
		performanceInfo = { expandAll: 0, collapseAll: 0, showNode: 0 };

		const start = performance.now();

		if (index === 0) {
			nodes = generateLargeTree();
			treeType = "large";
			lastDeepNodeId = null;
		} else {
			const { nodes: deepNodes, lastId } = generateDeepTree();

			nodes = deepNodes;
			lastDeepNodeId = lastId;
			treeType = "deep";
		}

		await tick();

		setTimeout(
			() => {
				const end = performance.now();

				console.log((index === 0 ? "Large" : "Deep") + " tree generation: " + (end - start).toFixed(2) + "ms");
			},
			0
		);
	}

	function handleExpandAll() {
		const start = performance.now();

		treeview?.expandAll();

		const end = performance.now();

		performanceInfo.expandAll = end - start;
		performanceInfo = performanceInfo;
	}

	function handleCollapseAll() {
		const start = performance.now();

		treeview?.collapseAll();

		const end = performance.now();

		performanceInfo.collapseAll = end - start;
		performanceInfo = performanceInfo;
	}

	function handleShowNode() {
		const start = performance.now();
		const targetId = treeType === "large" ? 999 : lastDeepNodeId === null ? 100 : lastDeepNodeId;

		if (treeview) {
			treeview.showNode(targetId);
		}

		const end = performance.now();

		performanceInfo.showNode = end - start;
		performanceInfo = performanceInfo;
	}

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node_1 = $.first_child(fragment_1);

			ContentSwitcher(node_1, {
				get selectedIndex() {
					return selectedIndex;
				},
				$$events: { change: handleTreeSwitch },
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Switch(node_2, { text: 'Large Tree (1000+ nodes)' });

					var node_3 = $.sibling(node_2, 2);

					Switch(node_3, { text: 'Deep Tree (100 levels)' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			ButtonSet(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_5 = $.first_child(fragment_3);

					Button(node_5, {
						$$events: { click: handleExpandAll },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Expand All');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Button(node_6, {
						$$events: { click: handleCollapseAll },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Collapse All');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						$$events: { click: handleShowNode },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Show Deep Node');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_4, 2);

			{
				var consequent = ($$anchor) => {
					Stack($$anchor, {
						gap: 2,
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var div = $.first_child(fragment_5);
							var text_3 = $.only_child(div);
							var div_1 = $.sibling(div, 2);
							var text_4 = $.only_child(div_1);
							var div_2 = $.sibling(div_1, 2);
							var text_5 = $.only_child(div_2);

							$.template_effect(
								($0, $1, $2) => {
									$.set_text(text_3, `Expand All: ${$0 ?? ''}ms`);
									$.set_text(text_4, `Collapse All: ${$1 ?? ''}ms`);
									$.set_text(text_5, `Show Node: ${$2 ?? ''}ms`);
								},
								[
									() => performanceInfo.expandAll.toFixed(2),
									() => performanceInfo.collapseAll.toFixed(2),
									() => performanceInfo.showNode.toFixed(2)
								]
							);

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_8, ($$render) => {
					if (performanceInfo.expandAll > 0 || performanceInfo.collapseAll > 0 || performanceInfo.showNode > 0) $$render(consequent);
				});
			}

			var div_3 = $.sibling(node_8, 2);
			var node_9 = $.child(div_3);

			{
				let $0 = $.derived(() => treeType === "large" ? "Large Tree (1000+ nodes)" : "Deep Tree (100 levels)");

				$.bind_this(
					TreeView(node_9, {
						get labelText() {
							return $.get($0);
						},

						get nodes() {
							return nodes;
						}
					}),
					($$value) => treeview = $$value,
					() => treeview
				);
			}

			$.reset(div_3);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}