import * as $ from 'svelte/internal/server';
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import StarIcon from "@lucide/svelte/icons/star";
import { untrack } from "svelte";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import BellIcon from "@lucide/svelte/icons/bell";
import ChartLineIcon from "@lucide/svelte/icons/chart-line";
import CopyIcon from "@lucide/svelte/icons/copy";
import CornerUpLeftIcon from "@lucide/svelte/icons/corner-up-left";
import CornerUpRightIcon from "@lucide/svelte/icons/corner-up-right";
import FileTextIcon from "@lucide/svelte/icons/file-text";
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import LinkIcon from "@lucide/svelte/icons/link";
import Settings2Icon from "@lucide/svelte/icons/settings-2";
import TrashIcon from "@lucide/svelte/icons/trash";
import Trash2Icon from "@lucide/svelte/icons/trash-2";

const data = [
	[
		{ label: "Customize Page", icon: Settings2Icon },
		{ label: "Turn into wiki", icon: FileTextIcon }
	],

	[
		{ label: "Copy Link", icon: LinkIcon },
		{ label: "Duplicate", icon: CopyIcon },
		{ label: "Move to", icon: CornerUpRightIcon },
		{ label: "Move to Trash", icon: Trash2Icon }
	],

	[
		{ label: "Undo", icon: CornerUpLeftIcon },
		{ label: "View analytics", icon: ChartLineIcon },
		{ label: "Version History", icon: GalleryVerticalEndIcon },
		{ label: "Show delete pages", icon: TrashIcon },
		{ label: "Notifications", icon: BellIcon }
	],

	[
		{ label: "Import", icon: ArrowUpIcon },
		{ label: "Export", icon: ArrowDownIcon }
	]
];

export default function Nav_actions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex items-center gap-2 text-sm"><div class="hidden font-medium text-muted-foreground md:inline-block">Edit Oct 08</div> `);

			Button($$renderer, {
				variant: 'ghost',
				size: 'icon',
				class: 'size-7',
				children: ($$renderer) => {
					StarIcon($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'ghost',
										size: 'icon',
										class: 'size-7 data-[state=open]:bg-accent',
										children: ($$renderer) => {
											EllipsisIcon($$renderer, {});
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-56 overflow-hidden rounded-lg p-0',
								align: 'end',
								children: ($$renderer) => {
									if (Sidebar.Root) {
										$$renderer.push('<!--[-->');

										Sidebar.Root($$renderer, {
											collapsible: 'none',
											class: 'bg-transparent',
											children: ($$renderer) => {
												if (Sidebar.Content) {
													$$renderer.push('<!--[-->');

													Sidebar.Content($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(data);

															for (let index = 0, $$length = each_array.length; index < $$length; index++) {
																let group = each_array[index];

																if (Sidebar.Group) {
																	$$renderer.push('<!--[-->');

																	Sidebar.Group($$renderer, {
																		class: 'border-b last:border-none',
																		children: ($$renderer) => {
																			if (Sidebar.GroupContent) {
																				$$renderer.push('<!--[-->');

																				Sidebar.GroupContent($$renderer, {
																					class: 'gap-0',
																					children: ($$renderer) => {
																						if (Sidebar.Menu) {
																							$$renderer.push('<!--[-->');

																							Sidebar.Menu($$renderer, {
																								children: ($$renderer) => {
																									$$renderer.push(`<!--[-->`);

																									const each_array_1 = $.ensure_array_like(group);

																									for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
																										let item = each_array_1[index];

																										if (Sidebar.MenuItem) {
																											$$renderer.push('<!--[-->');

																											Sidebar.MenuItem($$renderer, {
																												children: ($$renderer) => {
																													if (Sidebar.MenuButton) {
																														$$renderer.push('<!--[-->');

																														Sidebar.MenuButton($$renderer, {
																															class: 'hover:bg-accent hover:text-accent-foreground',
																															children: ($$renderer) => {
																																if (item.icon) {
																																	$$renderer.push('<!--[-->');
																																	item.icon($$renderer, {});
																																	$$renderer.push('<!--]-->');
																																} else {
																																	$$renderer.push('<!--[!-->');
																																	$$renderer.push('<!--]-->');
																																}

																																$$renderer.push(` <span>${$.escape(item.label)}</span>`);
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

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}