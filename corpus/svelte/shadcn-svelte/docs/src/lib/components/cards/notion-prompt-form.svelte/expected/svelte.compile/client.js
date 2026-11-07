import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import AtIcon from "@lucide/svelte/icons/at-sign";
import BookIcon from "@lucide/svelte/icons/book";
import CirclePlusIcon from "@lucide/svelte/icons/circle-plus";
import GlobeIcon from "@lucide/svelte/icons/globe";
import AppsIcon from "@lucide/svelte/icons/grid-3x3";
import PaperclipIcon from "@lucide/svelte/icons/paperclip";
import PlusIcon from "@lucide/svelte/icons/plus";
import XIcon from "@lucide/svelte/icons/x";
import * as Command from "$lib/registry/ui/command/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Avatar, AvatarFallback, AvatarImage } from "$lib/registry/ui/avatar/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

const MentionableIcon = ($$anchor, $$arg0) => {
	let item = () => ($$arg0?.()).item;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, item().image));
			$.append($$anchor, span);
		};

		var alternate = ($$anchor) => {
			Avatar($$anchor, {
				class: 'size-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					AvatarImage(node_1, {
						get src() {
							return item().image;
						}
					});

					var node_2 = $.sibling(node_1, 2);

					AvatarFallback(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, item().title[0]));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (item().type === "page") $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<span class="flex size-4 items-center justify-center"> </span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> `, 1);
var root_3 = $.from_html(`<!> <div class="-m-1.5 no-scrollbar flex gap-1 overflow-y-auto p-1.5"></div>`, 1);
var root_4 = $.from_html(` <!>`, 1);
var root_5 = $.from_html(`<!> All Sources`, 1);
var root_6 = $.from_html(`<label><!> Web Search <!></label>`);
var root_7 = $.from_html(`<label><!> Apps and Integrations <!></label>`);
var root_8 = $.from_html(`<!> All Sources I can access`, 1);
var root_9 = $.from_html(`<!> shadcn`, 1);
var root_10 = $.from_html(`<!> <span class="text-muted-foreground"> </span>`, 1);
var root_11 = $.from_html(`<!> Help Center`, 1);
var root_12 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_13 = $.from_html(`<!> Connect Apps`, 1);
var root_14 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_15 = $.from_html(`<!> <!> <!>`, 1);
var root_16 = $.from_html(`<form class="[--radius:1.2rem]"><!></form>`);

export default function Notion_prompt_form($$anchor) {
	const SAMPLE_DATA = {
		mentionable: [
			{ type: "page", title: "Meeting Notes", image: "📝" },
			{ type: "page", title: "Project Dashboard", image: "📊" },
			{ type: "page", title: "Ideas & Brainstorming", image: "💡" },
			{ type: "page", title: "Calendar & Events", image: "📅" },
			{ type: "page", title: "Documentation", image: "📚" },
			{ type: "page", title: "Goals & Objectives", image: "🎯" },
			{ type: "page", title: "Budget Planning", image: "💰" },
			{ type: "page", title: "Team Directory", image: "👥" },
			{ type: "page", title: "Technical Specs", image: "🔧" },
			{ type: "page", title: "Analytics Report", image: "📈" },
			{
				type: "user",
				title: "shadcn",
				image: "https://github.com/shadcn.png",
				workspace: "Workspace"
			},

			{
				type: "user",
				title: "maxleiter",
				image: "https://github.com/maxleiter.png",
				workspace: "Workspace"
			},

			{
				type: "user",
				title: "evilrabbit",
				image: "https://github.com/evilrabbit.png",
				workspace: "Workspace"
			}
		],
		models: [
			{ name: "Auto" },
			{ name: "Agent Mode", badge: "Beta" },
			{ name: "Plan Mode" }
		]
	};

	let mentions = $.state($.proxy([]));
	let mentionPopoverOpen = $.state(false);
	let modelPopoverOpen = $.state(false);
	let selectedModel = $.state($.proxy(SAMPLE_DATA.models[0]));
	let scopeMenuOpen = $.state(false);

	const grouped = $.derived(() => () => {
		return SAMPLE_DATA.mentionable.reduce(
			(acc, item) => {
				const isAvailable = !$.get(mentions).includes(item.title);

				if (isAvailable) {
					if (!acc[item.type]) {
						acc[item.type] = [];
					}

					acc[item.type].push(item);
				}

				return acc;
			},
			{}
		);
	});

	const hasMentions = $.derived(() => $.get(mentions).length > 0);
	var form = root_16();
	var node_3 = $.child(form);

	$.component(node_3, () => Field.Group, ($$anchor, Field_Group) => {
		Field_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_4 = $.first_child(fragment_4);

				$.component(node_4, () => Field.Label, ($$anchor, Field_Label) => {
					Field_Label($$anchor, {
						for: 'notion-prompt',
						class: 'sr-only',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Prompt');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
					InputGroup_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_15();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => InputGroup.Textarea, ($$anchor, InputGroup_Textarea) => {
								InputGroup_Textarea($$anchor, {
									id: 'notion-prompt',
									placeholder: 'Ask, search, or make anything...'
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
								InputGroup_Addon($$anchor, {
									align: 'block-start',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_3();
										var node_8 = $.first_child(fragment_6);

										$.component(node_8, () => Popover.Root, ($$anchor, Popover_Root) => {
											Popover_Root($$anchor, {
												get open() {
													return $.get(mentionPopoverOpen);
												},

												set open($$value) {
													$.set(mentionPopoverOpen, $$value, true);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_1();
													var node_9 = $.first_child(fragment_7);

													$.component(node_9, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
														Tooltip_Root($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_1();
																var node_10 = $.first_child(fragment_8);

																{
																	const child = ($$anchor, $$arg0) => {
																		let props = () => ($$arg0?.()).props;
																		var fragment_9 = $.comment();
																		var node_11 = $.first_child(fragment_9);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;
																				var fragment_10 = $.comment();
																				var node_12 = $.first_child(fragment_10);

																				{
																					let $0 = $.derived(() => !$.get(hasMentions) ? "sm" : "icon-sm");

																					$.component(node_12, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																						InputGroup_Button($$anchor, $.spread_props(props, {
																							variant: 'outline',
																							get size() {
																								return $.get($0);
																							},
																							class: 'rounded-full transition-transform',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_11 = root_2();
																								var node_13 = $.first_child(fragment_11);

																								AtIcon(node_13, {});

																								var text_3 = $.sibling(node_13);

																								$.template_effect(() => $.set_text(text_3, ` ${!$.get(hasMentions) && "Add context"}`));
																								$.append($$anchor, fragment_11);
																							},
																							$$slots: { default: true }
																						}));
																					});
																				}

																				$.append($$anchor, fragment_10);
																			};

																			$.component(node_11, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
																				Popover_Trigger($$anchor, $.spread_props(props, { child, $$slots: { child: true } }));
																			});
																		}

																		$.append($$anchor, fragment_9);
																	};

																	$.component(node_10, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																		Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
																	});
																}

																var node_14 = $.sibling(node_10, 2);

																$.component(node_14, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																	Tooltip_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_4 = $.text('Mention a person, page, or date');

																			$.append($$anchor, text_4);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													var node_15 = $.sibling(node_9, 2);

													$.component(node_15, () => Popover.Content, ($$anchor, Popover_Content) => {
														Popover_Content($$anchor, {
															class: 'p-0 [--radius:1.2rem]',
															align: 'start',
															children: ($$anchor, $$slotProps) => {
																var fragment_12 = $.comment();
																var node_16 = $.first_child(fragment_12);

																$.component(node_16, () => Command.Root, ($$anchor, Command_Root) => {
																	Command_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_13 = root_1();
																			var node_17 = $.first_child(fragment_13);

																			$.component(node_17, () => Command.Input, ($$anchor, Command_Input) => {
																				Command_Input($$anchor, { placeholder: 'Search pages...' });
																			});

																			var node_18 = $.sibling(node_17, 2);

																			$.component(node_18, () => Command.List, ($$anchor, Command_List) => {
																				Command_List($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_14 = root_1();
																						var node_19 = $.first_child(fragment_14);

																						$.component(node_19, () => Command.Empty, ($$anchor, Command_Empty) => {
																							Command_Empty($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_5 = $.text('No pages found');

																									$.append($$anchor, text_5);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_20 = $.sibling(node_19, 2);

																						$.each(node_20, 17, () => Object.entries($.get(grouped)), ([type, items]) => type, ($$anchor, $$item) => {
																							var $$array = $.derived(() => $.to_array($.get($$item), 2));
																							let type = () => $.get($$array)[0];
																							let items = () => $.get($$array)[1];
																							var fragment_15 = $.comment();
																							var node_21 = $.first_child(fragment_15);

																							{
																								let $0 = $.derived(() => type() === "page" ? "Pages" : "Users");

																								$.component(node_21, () => Command.Group, ($$anchor, Command_Group) => {
																									Command_Group($$anchor, {
																										get heading() {
																											return $.get($0);
																										},

																										children: ($$anchor, $$slotProps) => {
																											var fragment_16 = $.comment();
																											var node_22 = $.first_child(fragment_16);

																											$.each(node_22, 17, items, (item) => item.title, ($$anchor, item) => {
																												var fragment_17 = $.comment();
																												var node_23 = $.first_child(fragment_17);

																												$.component(node_23, () => Command.Item, ($$anchor, Command_Item) => {
																													Command_Item($$anchor, {
																														get value() {
																															return $.get(item).title;
																														},

																														onSelect: () => {
																															$.set(mentions, [...$.get(mentions), $.get(item)], true);
																															$.set(mentionPopoverOpen, false);
																														},

																														children: ($$anchor, $$slotProps) => {
																															var fragment_18 = root_2();
																															var node_24 = $.first_child(fragment_18);

																															MentionableIcon(node_24, () => ({ item: $.get(item) }));

																															var text_6 = $.sibling(node_24);

																															$.template_effect(() => $.set_text(text_6, ` ${$.get(item).title ?? ''}`));
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
																							}

																							$.append($$anchor, fragment_15);
																						});

																						$.append($$anchor, fragment_14);
																					},
																					$$slots: { default: true }
																				});
																			});

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

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var div = $.sibling(node_8, 2);

										$.each(div, 20, () => $.get(mentions), (mention) => mention, ($$anchor, mention) => {
											const item = $.derived(() => SAMPLE_DATA.mentionable.find((item) => item.title === mention));
											var fragment_19 = $.comment();
											var node_25 = $.first_child(fragment_19);

											{
												var consequent_1 = ($$anchor) => {
													var fragment_20 = $.comment();
													var node_26 = $.first_child(fragment_20);

													$.component(node_26, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
														InputGroup_Button_1($$anchor, {
															size: 'sm',
															variant: 'secondary',
															class: 'rounded-full !ps-2',
															onclick: () => {
																$.set(mentions, $.get(mentions).filter((m) => m !== mention), true);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_21 = root_1();
																var node_27 = $.first_child(fragment_21);

																MentionableIcon(node_27, () => ({ item: $.get(item) }));

																var text_7 = $.sibling(node_27);
																var node_28 = $.sibling(text_7);

																XIcon(node_28, {});
																$.template_effect(() => $.set_text(text_7, ` ${$.get(item).title ?? ''} `));
																$.append($$anchor, fragment_21);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_20);
												};

												$.if(node_25, ($$render) => {
													if ($.get(item)) $$render(consequent_1);
												});
											}

											$.append($$anchor, fragment_19);
										});

										$.reset(div);
										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_29 = $.sibling(node_7, 2);

							$.component(node_29, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
								InputGroup_Addon_1($$anchor, {
									align: 'block-end',
									class: 'gap-1',
									children: ($$anchor, $$slotProps) => {
										var fragment_22 = root_12();
										var node_30 = $.first_child(fragment_22);

										$.component(node_30, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
											Tooltip_Root_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_23 = root_1();
													var node_31 = $.first_child(fragment_23);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;
															var fragment_24 = $.comment();
															var node_32 = $.first_child(fragment_24);

															$.component(node_32, () => InputGroup.Button, ($$anchor, InputGroup_Button_2) => {
																InputGroup_Button_2($$anchor, $.spread_props(props, {
																	size: 'icon-sm',
																	class: 'rounded-full',
																	'aria-label': 'Attach file',
																	children: ($$anchor, $$slotProps) => {
																		PaperclipIcon($$anchor, {});
																	},
																	$$slots: { default: true }
																}));
															});

															$.append($$anchor, fragment_24);
														};

														$.component(node_31, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
															Tooltip_Trigger_1($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_33 = $.sibling(node_31, 2);

													$.component(node_33, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
														Tooltip_Content_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('Attach file');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_23);
												},
												$$slots: { default: true }
											});
										});

										var node_34 = $.sibling(node_30, 2);

										$.component(node_34, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
											DropdownMenu_Root($$anchor, {
												get open() {
													return $.get(modelPopoverOpen);
												},

												set open($$value) {
													$.set(modelPopoverOpen, $$value, true);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_26 = root_1();
													var node_35 = $.first_child(fragment_26);

													$.component(node_35, () => Tooltip.Root, ($$anchor, Tooltip_Root_2) => {
														Tooltip_Root_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_27 = root_1();
																var node_36 = $.first_child(fragment_27);

																{
																	const child = ($$anchor, $$arg0) => {
																		let props = () => ($$arg0?.()).props;
																		var fragment_28 = $.comment();
																		var node_37 = $.first_child(fragment_28);

																		{
																			const child = ($$anchor, $$arg0) => {
																				let props = () => ($$arg0?.()).props;
																				var fragment_29 = $.comment();
																				var node_38 = $.first_child(fragment_29);

																				$.component(node_38, () => InputGroup.Button, ($$anchor, InputGroup_Button_3) => {
																					InputGroup_Button_3($$anchor, $.spread_props(props, {
																						size: 'sm',
																						class: 'rounded-full',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_9 = $.text();

																							$.template_effect(() => $.set_text(text_9, $.get(selectedModel).name));
																							$.append($$anchor, text_9);
																						},
																						$$slots: { default: true }
																					}));
																				});

																				$.append($$anchor, fragment_29);
																			};

																			$.component(node_37, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
																				DropdownMenu_Trigger($$anchor, $.spread_props(props, { child, $$slots: { child: true } }));
																			});
																		}

																		$.append($$anchor, fragment_28);
																	};

																	$.component(node_36, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
																		Tooltip_Trigger_2($$anchor, { child, $$slots: { child: true } });
																	});
																}

																var node_39 = $.sibling(node_36, 2);

																$.component(node_39, () => Tooltip.Content, ($$anchor, Tooltip_Content_2) => {
																	Tooltip_Content_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_10 = $.text('Select AI model');

																			$.append($$anchor, text_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_27);
															},
															$$slots: { default: true }
														});
													});

													var node_40 = $.sibling(node_35, 2);

													$.component(node_40, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
														DropdownMenu_Content($$anchor, {
															side: 'top',
															align: 'start',
															class: '[--radius:1rem]',
															children: ($$anchor, $$slotProps) => {
																var fragment_31 = $.comment();
																var node_41 = $.first_child(fragment_31);

																$.component(node_41, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																	DropdownMenu_Group($$anchor, {
																		class: 'w-42',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_32 = root_1();
																			var node_42 = $.first_child(fragment_32);

																			$.component(node_42, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																				DropdownMenu_Label($$anchor, {
																					class: 'text-xs text-muted-foreground',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_11 = $.text('Select Agent Mode');

																						$.append($$anchor, text_11);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_43 = $.sibling(node_42, 2);

																			$.each(node_43, 17, () => SAMPLE_DATA.models, (model) => model.name, ($$anchor, model) => {
																				var fragment_33 = $.comment();
																				var node_44 = $.first_child(fragment_33);

																				{
																					let $0 = $.derived(() => $.get(model).name === $.get(selectedModel).name);

																					$.component(node_44, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
																						DropdownMenu_CheckboxItem($$anchor, {
																							get checked() {
																								return $.get($0);
																							},

																							onCheckedChange: (checked) => {
																								if (checked) {
																									$.set(selectedModel, $.get(model), true);
																								}
																							},
																							class: 'ps-2 *:[span:first-child]:start-auto *:[span:first-child]:end-2',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var fragment_34 = root_4();
																								var text_12 = $.first_child(fragment_34);
																								var node_45 = $.sibling(text_12);

																								{
																									var consequent_2 = ($$anchor) => {
																										Badge($$anchor, {
																											variant: 'secondary',
																											class: 'h-5 rounded-sm bg-blue-100 px-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-100',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_13 = $.text();

																												$.template_effect(() => $.set_text(text_13, $.get(model).badge));
																												$.append($$anchor, text_13);
																											},
																											$$slots: { default: true }
																										});
																									};

																									$.if(node_45, ($$render) => {
																										if ($.get(model).badge) $$render(consequent_2);
																									});
																								}

																								$.template_effect(() => $.set_text(text_12, `${$.get(model).name ?? ''} `));
																								$.append($$anchor, fragment_34);
																							},
																							$$slots: { default: true }
																						});
																					});
																				}

																				$.append($$anchor, fragment_33);
																			});

																			$.append($$anchor, fragment_32);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_31);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_26);
												},
												$$slots: { default: true }
											});
										});

										var node_46 = $.sibling(node_34, 2);

										$.component(node_46, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
											DropdownMenu_Root_1($$anchor, {
												get open() {
													return $.get(scopeMenuOpen);
												},

												set open($$value) {
													$.set(scopeMenuOpen, $$value, true);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_37 = root_1();
													var node_47 = $.first_child(fragment_37);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;
															var fragment_38 = $.comment();
															var node_48 = $.first_child(fragment_38);

															$.component(node_48, () => InputGroup.Button, ($$anchor, InputGroup_Button_4) => {
																InputGroup_Button_4($$anchor, $.spread_props(props, {
																	size: 'sm',
																	class: 'rounded-full',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_39 = root_5();
																		var node_49 = $.first_child(fragment_39);

																		GlobeIcon(node_49, {});
																		$.next();
																		$.append($$anchor, fragment_39);
																	},
																	$$slots: { default: true }
																}));
															});

															$.append($$anchor, fragment_38);
														};

														$.component(node_47, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
															DropdownMenu_Trigger_1($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_50 = $.sibling(node_47, 2);

													$.component(node_50, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
														DropdownMenu_Content_1($$anchor, {
															side: 'top',
															align: 'end',
															class: '[--radius:1rem]',
															children: ($$anchor, $$slotProps) => {
																var fragment_40 = root_14();
																var node_51 = $.first_child(fragment_40);

																$.component(node_51, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																	DropdownMenu_Group_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_41 = $.comment();
																			var node_52 = $.first_child(fragment_41);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;
																					var label = root_6();

																					$.attribute_effect(label, () => ({ for: 'web-search', ...props() }));

																					var node_53 = $.child(label);

																					GlobeIcon(node_53, {});

																					var node_54 = $.sibling(node_53, 2);

																					Switch(node_54, { id: 'web-search', class: 'ms-auto', checked: true });
																					$.reset(label);
																					$.append($$anchor, label);
																				};

																				$.component(node_52, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																					DropdownMenu_Item($$anchor, {
																						onSelect: (e) => e.preventDefault(),
																						child,
																						$$slots: { child: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_41);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_55 = $.sibling(node_51, 2);

																$.component(node_55, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																	DropdownMenu_Separator($$anchor, {});
																});

																var node_56 = $.sibling(node_55, 2);

																$.component(node_56, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
																	DropdownMenu_Group_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_42 = root_12();
																			var node_57 = $.first_child(fragment_42);

																			{
																				const child = ($$anchor, $$arg0) => {
																					let props = () => ($$arg0?.()).props;
																					var label_1 = root_7();

																					$.attribute_effect(label_1, () => ({ for: 'apps', ...props() }));

																					var node_58 = $.child(label_1);

																					AppsIcon(node_58, {});

																					var node_59 = $.sibling(node_58, 2);

																					Switch(node_59, { id: 'apps', class: 'ms-auto', checked: true });
																					$.reset(label_1);
																					$.append($$anchor, label_1);
																				};

																				$.component(node_57, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																					DropdownMenu_Item_1($$anchor, {
																						onSelect: (e) => e.preventDefault(),
																						child,
																						$$slots: { child: true }
																					});
																				});
																			}

																			var node_60 = $.sibling(node_57, 2);

																			$.component(node_60, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																				DropdownMenu_Item_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_43 = root_8();
																						var node_61 = $.first_child(fragment_43);

																						CirclePlusIcon(node_61, {});
																						$.next();
																						$.append($$anchor, fragment_43);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_62 = $.sibling(node_60, 2);

																			$.component(node_62, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
																				DropdownMenu_Sub($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_44 = root_1();
																						var node_63 = $.first_child(fragment_44);

																						$.component(node_63, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
																							DropdownMenu_SubTrigger($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_45 = root_9();
																									var node_64 = $.first_child(fragment_45);

																									Avatar(node_64, {
																										class: 'size-4',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_46 = root_1();
																											var node_65 = $.first_child(fragment_46);

																											AvatarImage(node_65, { src: 'https://github.com/shadcn.png' });

																											var node_66 = $.sibling(node_65, 2);

																											AvatarFallback(node_66, {
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_14 = $.text('CN');

																													$.append($$anchor, text_14);
																												},
																												$$slots: { default: true }
																											});

																											$.append($$anchor, fragment_46);
																										},
																										$$slots: { default: true }
																									});

																									$.next();
																									$.append($$anchor, fragment_45);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_67 = $.sibling(node_63, 2);

																						$.component(node_67, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																							DropdownMenu_SubContent($$anchor, {
																								class: 'w-72 p-0 [--radius:1rem]',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_47 = $.comment();
																									var node_68 = $.first_child(fragment_47);

																									$.component(node_68, () => Command.Root, ($$anchor, Command_Root_1) => {
																										Command_Root_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												var fragment_48 = root_1();
																												var node_69 = $.first_child(fragment_48);

																												$.component(node_69, () => Command.Input, ($$anchor, Command_Input_1) => {
																													Command_Input_1($$anchor, { placeholder: 'Find or use knowledge in...', autofocus: true });
																												});

																												var node_70 = $.sibling(node_69, 2);

																												$.component(node_70, () => Command.List, ($$anchor, Command_List_1) => {
																													Command_List_1($$anchor, {
																														children: ($$anchor, $$slotProps) => {
																															var fragment_49 = root_1();
																															var node_71 = $.first_child(fragment_49);

																															$.component(node_71, () => Command.Empty, ($$anchor, Command_Empty_1) => {
																																Command_Empty_1($$anchor, {
																																	children: ($$anchor, $$slotProps) => {
																																		$.next();

																																		var text_15 = $.text('No knowledge found');

																																		$.append($$anchor, text_15);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															var node_72 = $.sibling(node_71, 2);

																															$.component(node_72, () => Command.Group, ($$anchor, Command_Group_1) => {
																																Command_Group_1($$anchor, {
																																	children: ($$anchor, $$slotProps) => {
																																		var fragment_50 = $.comment();
																																		var node_73 = $.first_child(fragment_50);

																																		$.each(node_73, 17, () => SAMPLE_DATA.mentionable.filter((item) => item.type === "user"), (user) => user.title, ($$anchor, user) => {
																																			var fragment_51 = $.comment();
																																			var node_74 = $.first_child(fragment_51);

																																			$.component(node_74, () => Command.Item, ($$anchor, Command_Item_1) => {
																																				Command_Item_1($$anchor, {
																																					get value() {
																																						return $.get(user).title;
																																					},

																																					onSelect: () => {
																																						// Handle user selection here
																																						console.log("Selected user:", $.get(user).title);
																																					},

																																					children: ($$anchor, $$slotProps) => {
																																						var fragment_52 = root_10();
																																						var node_75 = $.first_child(fragment_52);

																																						Avatar(node_75, {
																																							class: 'size-4',
																																							children: ($$anchor, $$slotProps) => {
																																								var fragment_53 = root_1();
																																								var node_76 = $.first_child(fragment_53);

																																								AvatarImage(node_76, {
																																									get src() {
																																										return $.get(user).image;
																																									}
																																								});

																																								var node_77 = $.sibling(node_76, 2);

																																								AvatarFallback(node_77, {
																																									children: ($$anchor, $$slotProps) => {
																																										$.next();

																																										var text_16 = $.text();

																																										$.template_effect(() => $.set_text(text_16, $.get(user).title[0]));
																																										$.append($$anchor, text_16);
																																									},
																																									$$slots: { default: true }
																																								});

																																								$.append($$anchor, fragment_53);
																																							},
																																							$$slots: { default: true }
																																						});

																																						var text_17 = $.sibling(node_75);
																																						var span_1 = $.sibling(text_17);
																																						var text_18 = $.only_child(span_1);

																																						$.template_effect(() => {
																																							$.set_text(text_17, ` ${$.get(user).title ?? ''} `);
																																							$.set_text(text_18, `- ${$.get(user).workspace ?? ''}`);
																																						});

																																						$.append($$anchor, fragment_52);
																																					},
																																					$$slots: { default: true }
																																				});
																																			});

																																			$.append($$anchor, fragment_51);
																																		});

																																		$.append($$anchor, fragment_50);
																																	},
																																	$$slots: { default: true }
																																});
																															});

																															$.append($$anchor, fragment_49);
																														},
																														$$slots: { default: true }
																													});
																												});

																												$.append($$anchor, fragment_48);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_47);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_44);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_78 = $.sibling(node_62, 2);

																			$.component(node_78, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																				DropdownMenu_Item_3($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_55 = root_11();
																						var node_79 = $.first_child(fragment_55);

																						BookIcon(node_79, {});
																						$.next();
																						$.append($$anchor, fragment_55);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_42);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_80 = $.sibling(node_56, 2);

																$.component(node_80, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																	DropdownMenu_Separator_1($$anchor, {});
																});

																var node_81 = $.sibling(node_80, 2);

																$.component(node_81, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_3) => {
																	DropdownMenu_Group_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_56 = root_1();
																			var node_82 = $.first_child(fragment_56);

																			$.component(node_82, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																				DropdownMenu_Item_4($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_57 = root_13();
																						var node_83 = $.first_child(fragment_57);

																						PlusIcon(node_83, {});
																						$.next();
																						$.append($$anchor, fragment_57);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_84 = $.sibling(node_82, 2);

																			$.component(node_84, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_1) => {
																				DropdownMenu_Label_1($$anchor, {
																					class: 'text-xs text-muted-foreground',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_19 = $.text('We\'ll only search in the sources selected here.');

																						$.append($$anchor, text_19);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_56);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_40);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_37);
												},
												$$slots: { default: true }
											});
										});

										var node_85 = $.sibling(node_46, 2);

										$.component(node_85, () => InputGroup.Button, ($$anchor, InputGroup_Button_5) => {
											InputGroup_Button_5($$anchor, {
												'aria-label': 'Send',
												class: 'ms-auto rounded-full',
												variant: 'default',
												size: 'icon-sm',
												children: ($$anchor, $$slotProps) => {
													ArrowUpIcon($$anchor, {});
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_22);
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

	$.reset(form);
	$.append($$anchor, form);
}