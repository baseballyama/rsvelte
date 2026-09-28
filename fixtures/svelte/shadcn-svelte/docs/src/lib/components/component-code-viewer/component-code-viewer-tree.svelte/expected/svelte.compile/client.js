import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import FileIcon from "@lucide/svelte/icons/file";
import FolderIcon from "@lucide/svelte/icons/folder";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import ComponentCodeViewerTree from "./component-code-viewer-tree.svelte";
import { ComponentCodeViewerContext } from "./component-code-viewer.svelte";

var root = $.from_html(`<!> <!> <span class="truncate pe-2"> </span>`, 1);
var root_1 = $.from_html(`<!> <!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Component_code_viewer_tree($$anchor, $$props) {
	$.push($$props, true);

	const ctx = ComponentCodeViewerContext.get();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
				Sidebar_MenuItem($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => $$props.index * ($$props.index === 2 ? 1.1 : 1.2));
							let $1 = $.derived(() => $$props.item.path === ctx.activeFile);

							$.component(node_2, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
								Sidebar_MenuButton($$anchor, {
									get style() {
										return `--index: ${$.get($0) ?? ''}rem`;
									},

									get isActive() {
										return $.get($1);
									},

									onclick: () => {
										if (!$$props.item.path) return;

										ctx.activeFile = $$props.item.path;
									},
									class: 'flex min-w-0 items-center rounded-none ps-(--index) hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15',
									get 'data-index'() {
										return $$props.index;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										ChevronRightIcon(node_3, { class: 'invisible shrink-0' });

										var node_4 = $.sibling(node_3, 2);

										FileIcon(node_4, { class: 'size-4 shrink-0' });

										var span = $.sibling(node_4, 2);
										var text = $.only_child(span, true);

										$.template_effect(() => $.set_text(text, $$props.item.name));
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_5 = $.first_child(fragment_4);

			$.component(node_5, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
				Sidebar_MenuItem_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_6 = $.first_child(fragment_5);

						$.component(node_6, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
							Collapsible_Root($$anchor, {
								class: 'group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90',
								open: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_7 = $.first_child(fragment_6);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;
											var fragment_7 = $.comment();
											var node_8 = $.first_child(fragment_7);

											$.component(node_8, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
												Sidebar_MenuButton_1($$anchor, $.spread_props(props, {
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root_1();
														var node_9 = $.first_child(fragment_8);

														ChevronRightIcon(node_9, { class: 'transition-transform' });

														var node_10 = $.sibling(node_9, 2);

														FolderIcon(node_10, {});

														var text_1 = $.sibling(node_10);

														$.template_effect(() => $.set_text(text_1, ` ${`ui/${$$props.item.name}`}`));
														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												}));
											});

											$.append($$anchor, fragment_7);
										};

										let $0 = $.derived(() => $$props.index * ($$props.index === 1 ? 1 : 1.2));

										$.component(node_7, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
											Collapsible_Trigger($$anchor, {
												get style() {
													return `--index: ${$.get($0) ?? ''}rem`;
												},
												class: 'rounded-none ps-(--index) whitespace-nowrap hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15',
												child,
												$$slots: { child: true }
											});
										});
									}

									var node_11 = $.sibling(node_7, 2);

									$.component(node_11, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
										Collapsible_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_12 = $.first_child(fragment_9);

												$.component(node_12, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
													Sidebar_MenuSub($$anchor, {
														class: 'm-0 w-full translate-x-0 border-none p-0',
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = $.comment();
															var node_13 = $.first_child(fragment_10);

															$.each(node_13, 17, () => $$props.item.children, $.index, ($$anchor, subItem) => {
																{
																	let $0 = $.derived(() => $$props.index + 1);

																	ComponentCodeViewerTree($$anchor, {
																		get item() {
																			return $.get(subItem);
																		},

																		get index() {
																			return $.get($0);
																		}
																	});
																}
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		};

		$.if(node, ($$render) => {
			if (!$$props.item.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}