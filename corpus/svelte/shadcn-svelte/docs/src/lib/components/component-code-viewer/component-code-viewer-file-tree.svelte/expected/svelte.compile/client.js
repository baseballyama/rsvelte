import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import ComponentCodeViewerTree from "./component-code-viewer-tree.svelte";
import { ComponentCodeViewerContext } from "./component-code-viewer.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Component_code_viewer_file_tree($$anchor, $$props) {
	$.push($$props, true);

	const ctx = ComponentCodeViewerContext.get();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			class: 'flex h-full !min-h-0 flex-col select-none',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
					Sidebar_Root($$anchor, {
						collapsible: 'none',
						class: 'h-full w-full flex-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
								Sidebar_GroupLabel($$anchor, {
									class: 'h-12 rounded-none border-b px-4 text-sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Files');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
								Sidebar_Group($$anchor, {
									class: 'overflow-y-auto p-0',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
											Sidebar_GroupContent($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
														Sidebar_Menu($$anchor, {
															class: 'translate-x-0 gap-1.5',
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_6 = $.first_child(fragment_5);

																{
																	var consequent = ($$anchor) => {
																		var fragment_6 = $.comment();
																		var node_7 = $.first_child(fragment_6);

																		$.each(node_7, 17, () => ctx.tree, $.index, ($$anchor, file) => {
																			ComponentCodeViewerTree($$anchor, {
																				get item() {
																					return $.get(file);
																				},
																				index: 1
																			});
																		});

																		$.append($$anchor, fragment_6);
																	};

																	$.if(node_6, ($$render) => {
																		if (ctx.tree) $$render(consequent);
																	});
																}

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
	});

	$.append($$anchor, fragment);
	$.pop();
}