import * as $ from 'svelte/internal/server';
import FileIcon from '@lucide/svelte/icons/file';
import FolderIcon from '@lucide/svelte/icons/folder';
import { TreeView, createTreeViewCollection } from '@skeletonlabs/skeleton-svelte';

function treeNode($$renderer, node, indexPath) {
	if (TreeView.NodeProvider) {
		$$renderer.push('<!--[-->');

		TreeView.NodeProvider($$renderer, {
			value: { node, indexPath },
			children: ($$renderer) => {
				if (node.children) {
					$$renderer.push('<!--[0-->');

					if (TreeView.Branch) {
						$$renderer.push('<!--[-->');

						TreeView.Branch($$renderer, {
							children: ($$renderer) => {
								if (TreeView.BranchControl) {
									$$renderer.push('<!--[-->');

									TreeView.BranchControl($$renderer, {
										children: ($$renderer) => {
											if (TreeView.BranchIndicator) {
												$$renderer.push('<!--[-->');
												TreeView.BranchIndicator($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (TreeView.BranchText) {
												$$renderer.push('<!--[-->');

												TreeView.BranchText($$renderer, {
													children: ($$renderer) => {
														FolderIcon($$renderer, { class: 'size-4' });
														$$renderer.push(`<!----> ${$.escape(node.name)}`);
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

								if (TreeView.BranchContent) {
									$$renderer.push('<!--[-->');

									TreeView.BranchContent($$renderer, {
										children: ($$renderer) => {
											if (TreeView.BranchIndentGuide) {
												$$renderer.push('<!--[-->');
												TreeView.BranchIndentGuide($$renderer, {});
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <!--[-->`);

											const each_array = $.ensure_array_like(node.children);

											for (let childIndex = 0, $$length = each_array.length; childIndex < $$length; childIndex++) {
												let childNode = each_array[childIndex];

												treeNode($$renderer, childNode, [...indexPath, childIndex]);
											}

											$$renderer.push(`<!--]-->`);
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
				} else {
					$$renderer.push('<!--[-1-->');

					if (TreeView.Item) {
						$$renderer.push('<!--[-->');

						TreeView.Item($$renderer, {
							children: ($$renderer) => {
								FileIcon($$renderer, { class: 'size-4' });
								$$renderer.push(`<!----> ${$.escape(node.name)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}

export default function Multiple_selection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		TreeView($$renderer, {
			collection,
			selectionMode: 'multiple',
			children: ($$renderer) => {
				if (TreeView.Label) {
					$$renderer.push('<!--[-->');

					TreeView.Label($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->File System`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (TreeView.Tree) {
					$$renderer.push('<!--[-->');

					TreeView.Tree($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(collection.rootNode.children || []);

							for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
								let node = each_array_1[index];

								treeNode($$renderer, node, [index]);
							}

							$$renderer.push(`<!--]-->`);
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