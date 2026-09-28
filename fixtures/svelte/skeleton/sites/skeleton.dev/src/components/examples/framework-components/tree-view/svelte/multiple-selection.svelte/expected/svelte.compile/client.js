import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FileIcon from '@lucide/svelte/icons/file';
import FolderIcon from '@lucide/svelte/icons/folder';
import { TreeView, createTreeViewCollection } from '@skeletonlabs/skeleton-svelte';

const treeNode = ($$anchor, node = $.noop, indexPath = $.noop) => {
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		let $0 = $.derived(() => ({ node: node(), indexPath: indexPath() }));

		$.component(node_1, () => TreeView.NodeProvider, ($$anchor, TreeView_NodeProvider) => {
			TreeView_NodeProvider($$anchor, {
				get value() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => TreeView.Branch, ($$anchor, TreeView_Branch) => {
								TreeView_Branch($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => TreeView.BranchControl, ($$anchor, TreeView_BranchControl) => {
											TreeView_BranchControl($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => TreeView.BranchIndicator, ($$anchor, TreeView_BranchIndicator) => {
														TreeView_BranchIndicator($$anchor, {});
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => TreeView.BranchText, ($$anchor, TreeView_BranchText) => {
														TreeView_BranchText($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = root();
																var node_7 = $.first_child(fragment_5);

																FolderIcon(node_7, { class: 'size-4' });

																var text = $.sibling(node_7);

																$.template_effect(() => $.set_text(text, ` ${node().name ?? ''}`));
																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_4, 2);

										$.component(node_8, () => TreeView.BranchContent, ($$anchor, TreeView_BranchContent) => {
											TreeView_BranchContent($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var node_9 = $.first_child(fragment_6);

													$.component(node_9, () => TreeView.BranchIndentGuide, ($$anchor, TreeView_BranchIndentGuide) => {
														TreeView_BranchIndentGuide($$anchor, {});
													});

													var node_10 = $.sibling(node_9, 2);

													$.each(node_10, 18, () => node().children, (childNode) => childNode, ($$anchor, childNode, childIndex) => {
														{
															let $0 = $.derived(() => [...indexPath(), $.get(childIndex)]);

															treeNode($$anchor, () => childNode, () => $.get($0));
														}
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						};

						var alternate = ($$anchor) => {
							var fragment_8 = $.comment();
							var node_11 = $.first_child(fragment_8);

							$.component(node_11, () => TreeView.Item, ($$anchor, TreeView_Item) => {
								TreeView_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root();
										var node_12 = $.first_child(fragment_9);

										FileIcon(node_12, { class: 'size-4' });

										var text_1 = $.sibling(node_12);

										$.template_effect(() => $.set_text(text_1, ` ${node().name ?? ''}`));
										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						};

						$.if(node_2, ($$render) => {
							if (node().children) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Multiple_selection($$anchor, $$props) {
	$.push($$props, true);

	const collection = createTreeViewCollection({
		nodeToValue: (node) => node.id,
		nodeToString: (node) => node.name,
		rootNode: {
			id: 'root',
			name: '',
			children: [
				{
					id: 'node_modules',
					name: 'node_modules',
					children: [
						{
							id: 'node_modules/@skeletonlabs',
							name: '@skeletonlabs',
							children: [
								{ id: 'node_modules/@skeletonlabs/skeleton', name: 'skeleton' }
							]
						}
					]
				},
				{ id: 'package.json', name: 'package.json' }
			]
		}
	});

	TreeView($$anchor, {
		get collection() {
			return collection;
		},
		selectionMode: 'multiple',
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_1();
			var node_13 = $.first_child(fragment_11);

			$.component(node_13, () => TreeView.Label, ($$anchor, TreeView_Label) => {
				TreeView_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('File System');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			var node_14 = $.sibling(node_13, 2);

			$.component(node_14, () => TreeView.Tree, ($$anchor, TreeView_Tree) => {
				TreeView_Tree($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_12 = $.comment();
						var node_15 = $.first_child(fragment_12);

						$.each(node_15, 18, () => collection.rootNode.children || [], (node) => node, ($$anchor, node, index) => {
							treeNode($$anchor, () => node, () => [$.get(index)]);
						});

						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	$.pop();
}