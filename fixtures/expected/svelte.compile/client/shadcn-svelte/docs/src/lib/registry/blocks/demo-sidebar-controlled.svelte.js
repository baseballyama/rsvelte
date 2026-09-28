import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
import FrameIcon from "@lucide/svelte/icons/frame";
import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
import MapIcon from "@lucide/svelte/icons/map";
import PanelLeftCloseIcon from "@lucide/svelte/icons/panel-left-close";
import PanelLeftOpenIcon from "@lucide/svelte/icons/panel-left-open";
import SendIcon from "@lucide/svelte/icons/send";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<a><!> <span> </span></a>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <span> </span>`, 1);
var root_3 = $.from_html(`<header class="flex h-12 items-center justify-between px-4"><!></header>`);

export default function Demo_sidebar_controlled($$anchor) {
	const projects = [
		{ name: "Design Engineering", url: "#", icon: FrameIcon },
		{ name: "Sales & Marketing", url: "#", icon: ChartPieIcon },
		{ name: "Travel", url: "#", icon: MapIcon },
		{ name: "Support", url: "#", icon: LifeBuoyIcon },
		{ name: "Feedback", url: "#", icon: SendIcon }
	];

	let open = $.state(true);
	var fragment = $.comment();
	var node = $.first_child(fragment);
	var bind_get = () => $.get(open);
	var bind_set = (v) => $.set(open, v, true);

	$.component(node, () => Sidebar.Provider, ($$anchor, Sidebar_Provider) => {
		Sidebar_Provider($$anchor, {
			get open() {
				return bind_get();
			},

			set open($$value) {
				bind_set($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
					Sidebar_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
								Sidebar_Content($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
											Sidebar_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
														Sidebar_GroupLabel($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Projects');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
														Sidebar_GroupContent($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_6 = $.first_child(fragment_5);

																$.component(node_6, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
																	Sidebar_Menu($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = $.comment();
																			var node_7 = $.first_child(fragment_6);

																			$.each(node_7, 17, () => projects, (project) => project.name, ($$anchor, project) => {
																				var fragment_7 = $.comment();
																				var node_8 = $.first_child(fragment_7);

																				$.component(node_8, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
																					Sidebar_MenuItem($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_8 = $.comment();
																							var node_9 = $.first_child(fragment_8);

																							{
																								const child = ($$anchor, $$arg0) => {
																									let props = () => ($$arg0?.()).props;
																									var a = root();

																									$.attribute_effect(a, () => ({ href: $.get(project).url, ...props() }));

																									var node_10 = $.child(a);

																									$.component(node_10, () => $.get(project).icon, ($$anchor, project_icon) => {
																										project_icon($$anchor, {});
																									});

																									var span = $.sibling(node_10, 2);
																									var text_1 = $.only_child(span, true);

																									$.reset(a);
																									$.template_effect(() => $.set_text(text_1, $.get(project).name));
																									$.append($$anchor, a);
																								};

																								$.component(node_9, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
																									Sidebar_MenuButton($$anchor, { child, $$slots: { child: true } });
																								});
																							}

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

				var node_11 = $.sibling(node_1, 2);

				$.component(node_11, () => Sidebar.Inset, ($$anchor, Sidebar_Inset) => {
					Sidebar_Inset($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var header = root_3();
							var node_12 = $.child(header);

							Button(node_12, {
								onclick: () => $.set(open, !$.get(open)),
								size: 'sm',
								variant: 'ghost',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_2();
									var node_13 = $.first_child(fragment_9);

									{
										var consequent = ($$anchor) => {
											PanelLeftCloseIcon($$anchor, {});
										};

										var alternate = ($$anchor) => {
											PanelLeftOpenIcon($$anchor, {});
										};

										$.if(node_13, ($$render) => {
											if ($.get(open)) $$render(consequent); else $$render(alternate, -1);
										});
									}

									var span_1 = $.sibling(node_13, 2);
									var text_2 = $.only_child(span_1);

									$.template_effect(() => $.set_text(text_2, `${$.get(open) ? "Close" : "Open"} Sidebar`));
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							$.reset(header);
							$.append($$anchor, header);
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
}