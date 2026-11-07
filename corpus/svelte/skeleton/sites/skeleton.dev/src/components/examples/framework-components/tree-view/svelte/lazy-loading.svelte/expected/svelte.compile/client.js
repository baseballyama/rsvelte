import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FileIcon from '@lucide/svelte/icons/file';
import FolderIcon from '@lucide/svelte/icons/folder';
import LoaderIcon from '@lucide/svelte/icons/loader';
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
										var fragment_3 = root_2();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => TreeView.BranchControl, ($$anchor, TreeView_BranchControl) => {
											TreeView_BranchControl($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => TreeView.BranchIndicator, ($$anchor, TreeView_BranchIndicator) => {
														TreeView_BranchIndicator($$anchor, { class: 'data-loading:hidden' });
													});

													var node_6 = $.sibling(node_5, 2);

													$.component(node_6, () => TreeView.BranchIndicator, ($$anchor, TreeView_BranchIndicator_1) => {
														TreeView_BranchIndicator_1($$anchor, {
															class: 'hidden data-loading:inline animate-spin',
															children: ($$anchor, $$slotProps) => {
																LoaderIcon($$anchor, { class: 'size-4' });
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => TreeView.BranchText, ($$anchor, TreeView_BranchText) => {
														TreeView_BranchText($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_6 = root();
																var node_8 = $.first_child(fragment_6);

																FolderIcon(node_8, { class: 'size-4' });

																var text = $.sibling(node_8);

																$.template_effect(() => $.set_text(text, ` ${node().name ?? ''}`));
																$.append($$anchor, fragment_6);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_4, 2);

										$.component(node_9, () => TreeView.BranchContent, ($$anchor, TreeView_BranchContent) => {
											TreeView_BranchContent($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_2();
													var node_10 = $.first_child(fragment_7);

													$.component(node_10, () => TreeView.BranchIndentGuide, ($$anchor, TreeView_BranchIndentGuide) => {
														TreeView_BranchIndentGuide($$anchor, {});
													});

													var node_11 = $.sibling(node_10, 2);

													$.each(node_11, 18, () => node().children ?? [], (childNode) => childNode, ($$anchor, childNode, childIndex) => {
														{
															let $0 = $.derived(() => [...indexPath(), $.get(childIndex)]);

															treeNode($$anchor, () => childNode, () => $.get($0));
														}
													});

													$.append($$anchor, fragment_7);
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
							var fragment_9 = $.comment();
							var node_12 = $.first_child(fragment_9);

							$.component(node_12, () => TreeView.Item, ($$anchor, TreeView_Item) => {
								TreeView_Item($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root();
										var node_13 = $.first_child(fragment_10);

										FileIcon(node_13, { class: 'size-4' });

										var text_1 = $.sibling(node_13);

										$.template_effect(() => $.set_text(text_1, ` ${node().name ?? ''}`));
										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_9);
						};

						$.if(node_2, ($$render) => {
							if (node().children || node().childrenCount) $$render(consequent); else $$render(alternate, -1);
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
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Lazy_loading($$anchor, $$props) {
	$.push($$props, true);

	const response = {
		node_modules: [
			{
				id: 'node_modules/@skeletonlabs',
				name: '@skeletonlabs',
				childrenCount: 3
			}
		],
		'node_modules/@skeletonlabs': [
			{ id: 'node_modules/@skeletonlabs/skeleton', name: 'skeleton' },
			{
				id: 'node_modules/@skeletonlabs/skeleton-react',
				name: 'skeleton-react'
			},

			{
				id: 'node_modules/@skeletonlabs/skeleton-svelte',
				name: 'skeleton-svelte'
			}
		]
	};

	let collection = $.state($.proxy(createTreeViewCollection({
		nodeToValue: (node) => node.id,
		nodeToString: (node) => node.name,
		rootNode: {
			id: 'root',
			name: '',
			children: [
				{ id: 'node_modules', name: 'node_modules', childrenCount: 1 },
				{ id: 'package.json', name: 'package.json' }
			]
		}
	})));

	const loadChildren = async (details) => {
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return response[details.node.id] || [];
	};

	const onLoadChildrenComplete = (details) => {
		$.set(collection, details.collection, true);
	};

	TreeView($$anchor, {
		get collection() {
			return $.get(collection);
		},
		loadChildren,
		onLoadChildrenComplete,
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_2();
			var node_14 = $.first_child(fragment_12);

			$.component(node_14, () => TreeView.Label, ($$anchor, TreeView_Label) => {
				TreeView_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('File System');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			var node_15 = $.sibling(node_14, 2);

			$.component(node_15, () => TreeView.Tree, ($$anchor, TreeView_Tree) => {
				TreeView_Tree($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_13 = $.comment();
						var node_16 = $.first_child(fragment_13);

						$.each(node_16, 18, () => $.get(collection).rootNode.children || [], (node) => node, ($$anchor, node, index) => {
							treeNode($$anchor, () => node, () => [$.get(index)]);
						});

						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	$.pop();
}