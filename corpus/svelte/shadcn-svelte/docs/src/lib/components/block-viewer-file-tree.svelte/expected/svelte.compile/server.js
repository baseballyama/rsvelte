import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import BlockViewerTree from "./block-viewer-tree.svelte";
import { BlockViewerContext } from "./block-viewer.svelte";

export default function Block_viewer_file_tree($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = BlockViewerContext.get();

		if (Sidebar.Provider) {
			$$renderer.push('<!--[-->');

			Sidebar.Provider($$renderer, {
				class: 'flex min-h-full! flex-col border-e',
				children: ($$renderer) => {
					if (Sidebar.Root) {
						$$renderer.push('<!--[-->');

						Sidebar.Root($$renderer, {
							collapsible: 'none',
							class: 'w-full flex-1',
							children: ($$renderer) => {
								if (Sidebar.GroupLabel) {
									$$renderer.push('<!--[-->');

									Sidebar.GroupLabel($$renderer, {
										class: 'h-12 rounded-none border-b px-4 text-sm',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Files`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Sidebar.Group) {
									$$renderer.push('<!--[-->');

									Sidebar.Group($$renderer, {
										class: 'p-0',
										children: ($$renderer) => {
											if (Sidebar.GroupContent) {
												$$renderer.push('<!--[-->');

												Sidebar.GroupContent($$renderer, {
													children: ($$renderer) => {
														if (Sidebar.Menu) {
															$$renderer.push('<!--[-->');

															Sidebar.Menu($$renderer, {
																class: 'translate-x-0 gap-1.5',
																children: ($$renderer) => {
																	if (ctx.tree) {
																		$$renderer.push(`<!--[0--><!--[-->`);

																		const each_array = $.ensure_array_like(ctx.tree);

																		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
																			let file = each_array[index];

																			BlockViewerTree($$renderer, { item: file, index: 1 });
																		}

																		$$renderer.push(`<!--]-->`);
																	} else {
																		$$renderer.push('<!--[-1-->');
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}