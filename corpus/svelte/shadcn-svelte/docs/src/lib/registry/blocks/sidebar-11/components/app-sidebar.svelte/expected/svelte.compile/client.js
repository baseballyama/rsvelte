import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import FileIcon from "@lucide/svelte/icons/file";
import FolderIcon from "@lucide/svelte/icons/folder";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";

const Tree = ($$anchor, $$arg0) => {
	let item = () => ($$arg0?.()).item;

	const computed_const = $.derived(() => {
		const [name, ...items] = Array.isArray(item()) ? item() : [item()];

		return { name, items };
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => $.get(computed_const).name === "button.svelte");

				$.component(node_1, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
					Sidebar_MenuButton($$anchor, {
						get isActive() {
							return $.get($0);
						},
						class: 'data-[active=true]:bg-transparent',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							FileIcon(node_2, {});

							var text = $.sibling(node_2);

							$.template_effect(() => $.set_text(text, ` ${$.get(computed_const).name ?? ''}`));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			$.component(node_3, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
				Sidebar_MenuItem($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_4 = $.first_child(fragment_4);

						{
							let $0 = $.derived(() => $.get(computed_const).name === "lib" || $.get(computed_const).name === "components");

							$.component(node_4, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
								Collapsible_Root($$anchor, {
									class: 'group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90',
									get open() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();
										var node_5 = $.first_child(fragment_5);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_6 = $.comment();
												var node_6 = $.first_child(fragment_6);

												$.component(node_6, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_1) => {
													Sidebar_MenuButton_1($$anchor, $.spread_props(props, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var node_7 = $.first_child(fragment_7);

															ChevronRightIcon(node_7, { class: 'transition-transform' });

															var node_8 = $.sibling(node_7, 2);

															FolderIcon(node_8, {});

															var text_1 = $.sibling(node_8);

															$.template_effect(() => $.set_text(text_1, ` ${$.get(computed_const).name ?? ''}`));
															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_6);
											};

											$.component(node_5, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
												Collapsible_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_9 = $.sibling(node_5, 2);

										$.component(node_9, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
											Collapsible_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = $.comment();
													var node_10 = $.first_child(fragment_8);

													$.component(node_10, () => Sidebar.MenuSub, ($$anchor, Sidebar_MenuSub) => {
														Sidebar_MenuSub($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = $.comment();
																var node_11 = $.first_child(fragment_9);

																$.each(node_11, 17, () => $.get(computed_const).items, $.index, ($$anchor, subItem) => {
																	Tree($$anchor, () => ({ item: $.get(subItem) }));
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

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (!$.get(computed_const).items.length) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
};

const data = {
	changes: [
		{ file: "README.md", state: "M" },
		{ file: "routes/+page.svelte", state: "U" },
		{ file: "routes/+layout.svelte", state: "M" }
	],
	tree: [
		[
			"lib",
			["components", "button.svelte", "card.svelte"],
			"utils.ts"
		],

		[
			"routes",
			["hello", "+page.svelte", "+page.ts"],
			"+page.svelte",
			"+page.server.ts",
			"+layout.svelte"
		],
		["static", "favicon.ico", "svelte.svg"],
		"eslint.config.js",
		".gitignore",
		"svelte.config.js",
		"tailwind.config.js",
		"package.json",
		"README.md"
	]
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);
var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function App_sidebar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment_11 = $.comment();
	var node_12 = $.first_child(fragment_11);

	$.component(node_12, () => Sidebar.Root, ($$anchor, Sidebar_Root) => {
		Sidebar_Root($$anchor, $.spread_props(() => restProps, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_12 = root_2();
				var node_13 = $.first_child(fragment_12);

				$.component(node_13, () => Sidebar.Content, ($$anchor, Sidebar_Content) => {
					Sidebar_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_2();
							var node_14 = $.first_child(fragment_13);

							$.component(node_14, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
								Sidebar_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root_2();
										var node_15 = $.first_child(fragment_14);

										$.component(node_15, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
											Sidebar_GroupLabel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Changes');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent) => {
											Sidebar_GroupContent($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = $.comment();
													var node_17 = $.first_child(fragment_15);

													$.component(node_17, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
														Sidebar_Menu($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = $.comment();
																var node_18 = $.first_child(fragment_16);

																$.each(node_18, 17, () => data.changes, $.index, ($$anchor, item) => {
																	var fragment_17 = $.comment();
																	var node_19 = $.first_child(fragment_17);

																	$.component(node_19, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem_1) => {
																		Sidebar_MenuItem_1($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_18 = root_2();
																				var node_20 = $.first_child(fragment_18);

																				$.component(node_20, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton_2) => {
																					Sidebar_MenuButton_2($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_19 = root();
																							var node_21 = $.first_child(fragment_19);

																							FileIcon(node_21, {});

																							var text_3 = $.sibling(node_21);

																							$.template_effect(() => $.set_text(text_3, ` ${$.get(item).file ?? ''}`));
																							$.append($$anchor, fragment_19);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_22 = $.sibling(node_20, 2);

																				$.component(node_22, () => Sidebar.MenuBadge, ($$anchor, Sidebar_MenuBadge) => {
																					Sidebar_MenuBadge($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_4 = $.text();

																							$.template_effect(() => $.set_text(text_4, $.get(item).state));
																							$.append($$anchor, text_4);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_18);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_17);
																});

																$.append($$anchor, fragment_16);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							var node_23 = $.sibling(node_14, 2);

							$.component(node_23, () => Sidebar.Group, ($$anchor, Sidebar_Group_1) => {
								Sidebar_Group_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_21 = root_2();
										var node_24 = $.first_child(fragment_21);

										$.component(node_24, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel_1) => {
											Sidebar_GroupLabel_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Files');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_25 = $.sibling(node_24, 2);

										$.component(node_25, () => Sidebar.GroupContent, ($$anchor, Sidebar_GroupContent_1) => {
											Sidebar_GroupContent_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_22 = $.comment();
													var node_26 = $.first_child(fragment_22);

													$.component(node_26, () => Sidebar.Menu, ($$anchor, Sidebar_Menu_1) => {
														Sidebar_Menu_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_23 = $.comment();
																var node_27 = $.first_child(fragment_23);

																$.each(node_27, 17, () => data.tree, $.index, ($$anchor, item) => {
																	Tree($$anchor, () => ({ item: $.get(item) }));
																});

																$.append($$anchor, fragment_23);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_22);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_21);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				});

				var node_28 = $.sibling(node_13, 2);

				$.component(node_28, () => Sidebar.Rail, ($$anchor, Sidebar_Rail) => {
					Sidebar_Rail($$anchor, {});
				});

				$.append($$anchor, fragment_12);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment_11);
	$.pop();
}