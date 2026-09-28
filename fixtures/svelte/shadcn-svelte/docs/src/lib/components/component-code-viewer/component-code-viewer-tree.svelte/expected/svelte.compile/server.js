import * as $ from 'svelte/internal/server';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import FileIcon from "@lucide/svelte/icons/file";
import FolderIcon from "@lucide/svelte/icons/folder";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import ComponentCodeViewerTree from "./component-code-viewer-tree.svelte";
import { ComponentCodeViewerContext } from "./component-code-viewer.svelte";

export default function Component_code_viewer_tree($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { item, index } = $$props;
		const ctx = ComponentCodeViewerContext.get();

		if (!item.children) {
			$$renderer.push('<!--[0-->');

			if (Sidebar.MenuItem) {
				$$renderer.push('<!--[-->');

				Sidebar.MenuItem($$renderer, {
					children: ($$renderer) => {
						if (Sidebar.MenuButton) {
							$$renderer.push('<!--[-->');

							Sidebar.MenuButton($$renderer, {
								style: `--index: ${$.stringify(index * (index === 2 ? 1.1 : 1.2))}rem`,
								isActive: item.path === ctx.activeFile,
								onclick: () => {
									if (!item.path) return;

									ctx.activeFile = item.path;
								},
								class: 'flex min-w-0 items-center rounded-none ps-(--index) hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15',
								'data-index': index,
								children: ($$renderer) => {
									ChevronRightIcon($$renderer, { class: 'invisible shrink-0' });
									$$renderer.push(`<!----> `);
									FileIcon($$renderer, { class: 'size-4 shrink-0' });
									$$renderer.push(`<!----> <span class="truncate pe-2">${$.escape(item.name)}</span>`);
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

			if (Sidebar.MenuItem) {
				$$renderer.push('<!--[-->');

				Sidebar.MenuItem($$renderer, {
					children: ($$renderer) => {
						if (Collapsible.Root) {
							$$renderer.push('<!--[-->');

							Collapsible.Root($$renderer, {
								class: 'group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90',
								open: true,
								children: ($$renderer) => {
									{
										function child($$renderer, { props }) {
											if (Sidebar.MenuButton) {
												$$renderer.push('<!--[-->');

												Sidebar.MenuButton($$renderer, $.spread_props([
													props,
													{
														children: ($$renderer) => {
															ChevronRightIcon($$renderer, { class: 'transition-transform' });
															$$renderer.push(`<!----> `);
															FolderIcon($$renderer, {});
															$$renderer.push(`<!----> ${$.escape(`ui/${item.name}`)}`);
														},
														$$slots: { default: true }
													}
												]));

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										if (Collapsible.Trigger) {
											$$renderer.push('<!--[-->');

											Collapsible.Trigger($$renderer, {
												style: `--index: ${$.stringify(index * (index === 1 ? 1 : 1.2))}rem`,
												class: 'rounded-none ps-(--index) whitespace-nowrap hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15',
												child,
												$$slots: { child: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(` `);

									if (Collapsible.Content) {
										$$renderer.push('<!--[-->');

										Collapsible.Content($$renderer, {
											children: ($$renderer) => {
												if (Sidebar.MenuSub) {
													$$renderer.push('<!--[-->');

													Sidebar.MenuSub($$renderer, {
														class: 'm-0 w-full translate-x-0 border-none p-0',
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(item.children);

															for (let key = 0, $$length = each_array.length; key < $$length; key++) {
																let subItem = each_array[key];

																ComponentCodeViewerTree($$renderer, { item: subItem, index: index + 1 });
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
		}

		$$renderer.push(`<!--]-->`);
	});
}