import 'svelte/internal/disclose-version';
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
import * as $ from 'svelte/internal/client';
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import StarIcon from "@lucide/svelte/icons/star";
import { untrack } from "svelte";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

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

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center gap-2 text-sm"><div class="hidden font-medium text-muted-foreground md:inline-block">Edit Oct 08</div> <!> <!></div>`);

export default function Nav_actions($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);

	$.user_effect(() => {
		untrack(() => {
			$.set(open, true);
		});
	});

	var div = root_2();
	var node = $.sibling($.child(div), 2);

	Button(node, {
		variant: 'ghost',
		size: 'icon',
		class: 'size-7',
		children: ($$anchor, $$slotProps) => {
			StarIcon($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_2 = $.first_child(fragment_1);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'ghost',
							size: 'icon',
							class: 'size-7 data-[state=open]:bg-accent',
							children: ($$anchor, $$slotProps) => {
								EllipsisIcon($$anchor, {});
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, { child, $$slots: { child: true } });
					});
				}

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-56 overflow-hidden rounded-lg p-0',
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.component(node_4, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
								Sidebar_Root($$anchor, {
									collapsible: 'none',
									class: 'bg-transparent',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
											Sidebar_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_6 = $.first_child(fragment_6);

													$.each(node_6, 17, () => data, $.index, ($$anchor, group) => {
														var fragment_7 = $.comment();
														var node_7 = $.first_child(fragment_7);

														$.component(node_7, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
															Sidebar_Group($$anchor, {
																class: 'border-b last:border-none',
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = $.comment();
																	var node_8 = $.first_child(fragment_8);

																	$.component(node_8, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
																		Sidebar_GroupContent($$anchor, {
																			class: 'gap-0',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = $.comment();
																				var node_9 = $.first_child(fragment_9);

																				$.component(node_9, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																					Sidebar_Menu($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_10 = $.comment();
																							var node_10 = $.first_child(fragment_10);

																							$.each(node_10, 17, () => $.get(group), $.index, ($$anchor, item, index, $$array) => {
																								var fragment_11 = $.comment();
																								var node_11 = $.first_child(fragment_11);

																								$.component(node_11, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																									Sidebar_MenuItem($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_12 = $.comment();
																											var node_12 = $.first_child(fragment_12);

																											$.component(node_12, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																												Sidebar_MenuButton($$anchor, {
																													class: 'hover:bg-accent hover:text-accent-foreground',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_13 = root();
																														var node_13 = $.first_child(fragment_13);

																														$.component(node_13, () => $.get(item).icon, ($$anchor, item_icon) => {
																															item_icon($$anchor, {});
																														});

																														var span = $.sibling(node_13, 2);
																														var text = $.only_child(span, true);

																														$.template_effect(() => $.set_text(text, $.get(item).label));
																														$.append($$anchor, fragment_13);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_12);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_11);
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

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
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
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}