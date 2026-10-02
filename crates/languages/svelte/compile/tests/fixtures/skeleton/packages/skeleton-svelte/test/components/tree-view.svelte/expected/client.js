import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TreeView, createTreeViewCollection } from '../../src/index.js';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tree_view($$anchor, $$props) {
	$.push($$props, true);

	const collection = createTreeViewCollection({ rootNode: '' });

	TreeView($$anchor, {
		get collection() {
			return collection;
		},
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => TreeView.Label, ($$anchor, TreeView_Label) => {
				TreeView_Label($$anchor, { 'data-testid': 'label' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => TreeView.Tree, ($$anchor, TreeView_Tree) => {
				TreeView_Tree($$anchor, {
					'data-testid': 'tree',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => TreeView.NodeProvider, ($$anchor, TreeView_NodeProvider) => {
							TreeView_NodeProvider($$anchor, {
								value: { node: '', indexPath: [] },
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => TreeView.Branch, ($$anchor, TreeView_Branch) => {
										TreeView_Branch($$anchor, {
											'data-testid': 'branch',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => TreeView.BranchControl, ($$anchor, TreeView_BranchControl) => {
													TreeView_BranchControl($$anchor, {
														'data-testid': 'branch-control',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_5 = $.first_child(fragment_5);

															$.component(node_5, () => TreeView.BranchIndentGuide, ($$anchor, TreeView_BranchIndentGuide) => {
																TreeView_BranchIndentGuide($$anchor, { 'data-testid': 'branch-indent-guide' });
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => TreeView.BranchIndicator, ($$anchor, TreeView_BranchIndicator) => {
																TreeView_BranchIndicator($$anchor, { 'data-testid': 'branch-indicator' });
															});

															var node_7 = $.sibling(node_6, 2);

															$.component(node_7, () => TreeView.BranchText, ($$anchor, TreeView_BranchText) => {
																TreeView_BranchText($$anchor, { 'data-testid': 'branch-text' });
															});

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

									var node_8 = $.sibling(node_3, 2);

									$.component(node_8, () => TreeView.Item, ($$anchor, TreeView_Item) => {
										TreeView_Item($$anchor, { 'data-testid': 'item' });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}