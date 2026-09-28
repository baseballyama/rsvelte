import * as $ from 'svelte/internal/server';
import { TreeView, createTreeViewCollection } from '../../src/index.js';

export default function Tree_view($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const collection = createTreeViewCollection({ rootNode: '' });

		TreeView($$renderer, {
			collection,
			'data-testid': 'root',
			children: ($$renderer) => {
				if (TreeView.Label) {
					$$renderer.push('<!--[-->');
					TreeView.Label($$renderer, { 'data-testid': 'label' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.Tree) {
					$$renderer.push('<!--[-->');

					TreeView.Tree($$renderer, {
						'data-testid': 'tree',
						children: ($$renderer) => {
							if (TreeView.NodeProvider) {
								$$renderer.push('<!--[-->');

								TreeView.NodeProvider($$renderer, {
									value: { node: '', indexPath: [] },
									children: ($$renderer) => {
										if (TreeView.Branch) {
											$$renderer.push('<!--[-->');

											TreeView.Branch($$renderer, {
												'data-testid': 'branch',
												children: ($$renderer) => {
													if (TreeView.BranchControl) {
														$$renderer.push('<!--[-->');

														TreeView.BranchControl($$renderer, {
															'data-testid': 'branch-control',
															children: ($$renderer) => {
																if (TreeView.BranchIndentGuide) {
																	$$renderer.push('<!--[-->');
																	TreeView.BranchIndentGuide($$renderer, { 'data-testid': 'branch-indent-guide' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (TreeView.BranchIndicator) {
																	$$renderer.push('<!--[-->');
																	TreeView.BranchIndicator($$renderer, { 'data-testid': 'branch-indicator' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (TreeView.BranchText) {
																	$$renderer.push('<!--[-->');
																	TreeView.BranchText($$renderer, { 'data-testid': 'branch-text' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (TreeView.Item) {
											$$renderer.push('<!--[-->');
											TreeView.Item($$renderer, { 'data-testid': 'item' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	});
}