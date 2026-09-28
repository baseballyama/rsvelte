import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mode } from "mode-watcher";
import "./raycast.css";
import { Command } from "bits-ui";
import { FigmaIcon, LinearIcon, RaycastIcon, SlackIcon, YouTubeIcon } from "../icons/index.js";
import Logo from "../logo.svelte";
import Item from "./item.svelte";
import { ClipboardIcon, HammerIcon, RaycastDarkIcon, RaycastLightIcon } from "./icons/index.js";
import SubCommand from "./sub-command.svelte";

var root = $.from_html(`<!> Linear`, 1);
var root_1 = $.from_html(`<!> Figma`, 1);
var root_2 = $.from_html(`<!> Slack`, 1);
var root_3 = $.from_html(`<!> YouTube`, 1);
var root_4 = $.from_html(`<!> Raycast`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<!> Clipboard History`, 1);
var root_8 = $.from_html(`<!> Import Extension`, 1);
var root_9 = $.from_html(`<!> Manage Extensions`, 1);
var root_10 = $.from_html(`<!> <!> <!>`, 1);
var root_11 = $.from_html(`<div data-command-raycast-top-shine=""></div> <!> <hr data-command-raycast-loader=""/> <!> <div data-command-raycast-footer=""><!> <button data-command-raycast-open-trigger="">Open Application <kbd>↵</kbd></button> <hr/> <!></div>`, 1);
var root_12 = $.from_html(`<div class="raycast"><!></div>`);

export default function Raycast_command($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state("linear");
	let inputEl = $.state(null);
	let listEl = $.state(null);
	var div = root_12();
	var node = $.child(div);

	$.component(node, () => Command.Root, ($$anchor, Command_Root) => {
		Command_Root($$anchor, {
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_11();
				var node_1 = $.sibling($.first_child(fragment), 2);

				$.component(node_1, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, {
						autofocus: true,
						placeholder: 'Search for apps and commands...',
						get ref() {
							return $.get(inputEl);
						},

						set ref($$value) {
							$.set(inputEl, $$value, true);
						}
					});
				});

				var node_2 = $.sibling(node_1, 4);

				$.component(node_2, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						get ref() {
							return $.get(listEl);
						},

						set ref($$value) {
							$.set(listEl, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => Command.Viewport, ($$anchor, Command_Viewport) => {
								Command_Viewport($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_10();
										var node_4 = $.first_child(fragment_2);

										$.component(node_4, () => Command.Empty, ($$anchor, Command_Empty) => {
											Command_Empty($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('No results found.');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Command.Group, ($$anchor, Command_Group) => {
											Command_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root_6();
													var node_6 = $.first_child(fragment_3);

													$.component(node_6, () => Command.GroupHeading, ($$anchor, Command_GroupHeading) => {
														Command_GroupHeading($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Suggestions');

																$.append($$anchor, text_1);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Command.GroupItems, ($$anchor, Command_GroupItems) => {
														Command_GroupItems($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = root_5();
																var node_8 = $.first_child(fragment_4);

																Item(node_8, {
																	value: 'linear',
																	keywords: ["issue", "sprint"],
																	children: ($$anchor, $$slotProps) => {
																		var fragment_5 = root();
																		var node_9 = $.first_child(fragment_5);

																		Logo(node_9, {
																			children: ($$anchor, $$slotProps) => {
																				LinearIcon($$anchor, { style: 'width: 12px; height: 12px' });
																			},
																			$$slots: { default: true }
																		});

																		$.next();
																		$.append($$anchor, fragment_5);
																	},
																	$$slots: { default: true }
																});

																var node_10 = $.sibling(node_8, 2);

																Item(node_10, {
																	value: 'figma',
																	keywords: ["design", "ui", "ux"],
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root_1();
																		var node_11 = $.first_child(fragment_7);

																		Logo(node_11, {
																			children: ($$anchor, $$slotProps) => {
																				FigmaIcon($$anchor, {});
																			},
																			$$slots: { default: true }
																		});

																		$.next();
																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});

																var node_12 = $.sibling(node_10, 2);

																Item(node_12, {
																	value: 'slack',
																	keywords: ["chat", "team", "communication"],
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root_2();
																		var node_13 = $.first_child(fragment_9);

																		Logo(node_13, {
																			children: ($$anchor, $$slotProps) => {
																				SlackIcon($$anchor, {});
																			},
																			$$slots: { default: true }
																		});

																		$.next();
																		$.append($$anchor, fragment_9);
																	},
																	$$slots: { default: true }
																});

																var node_14 = $.sibling(node_12, 2);

																Item(node_14, {
																	value: 'youtube',
																	keywords: ["video", "watch", "stream"],
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = root_3();
																		var node_15 = $.first_child(fragment_11);

																		Logo(node_15, {
																			children: ($$anchor, $$slotProps) => {
																				YouTubeIcon($$anchor, {});
																			},
																			$$slots: { default: true }
																		});

																		$.next();
																		$.append($$anchor, fragment_11);
																	},
																	$$slots: { default: true }
																});

																var node_16 = $.sibling(node_14, 2);

																Item(node_16, {
																	value: 'raycast',
																	keywords: ["productivity", "tools", "apps"],
																	children: ($$anchor, $$slotProps) => {
																		var fragment_13 = root_4();
																		var node_17 = $.first_child(fragment_13);

																		Logo(node_17, {
																			children: ($$anchor, $$slotProps) => {
																				RaycastIcon($$anchor, {});
																			},
																			$$slots: { default: true }
																		});

																		$.next();
																		$.append($$anchor, fragment_13);
																	},
																	$$slots: { default: true }
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

										var node_18 = $.sibling(node_5, 2);

										$.component(node_18, () => Command.Group, ($$anchor, Command_Group_1) => {
											Command_Group_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root_6();
													var node_19 = $.first_child(fragment_15);

													$.component(node_19, () => Command.GroupHeading, ($$anchor, Command_GroupHeading_1) => {
														Command_GroupHeading_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Commands');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_20 = $.sibling(node_19, 2);

													$.component(node_20, () => Command.GroupItems, ($$anchor, Command_GroupItems_1) => {
														Command_GroupItems_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = root_10();
																var node_21 = $.first_child(fragment_16);

																Item(node_21, {
																	isCommand: true,
																	value: 'clipboard history',
																	keywords: ["copy", "paste", "clipboard"],
																	children: ($$anchor, $$slotProps) => {
																		var fragment_17 = root_7();
																		var node_22 = $.first_child(fragment_17);

																		Logo(node_22, {
																			children: ($$anchor, $$slotProps) => {
																				ClipboardIcon($$anchor, {});
																			},
																			$$slots: { default: true }
																		});

																		$.next();
																		$.append($$anchor, fragment_17);
																	},
																	$$slots: { default: true }
																});

																var node_23 = $.sibling(node_21, 2);

																Item(node_23, {
																	isCommand: true,
																	value: 'import extension',
																	keywords: ["import", "extension"],
																	children: ($$anchor, $$slotProps) => {
																		var fragment_19 = root_8();
																		var node_24 = $.first_child(fragment_19);

																		Logo(node_24, {
																			children: ($$anchor, $$slotProps) => {
																				HammerIcon($$anchor, {});
																			},
																			$$slots: { default: true }
																		});

																		$.next();
																		$.append($$anchor, fragment_19);
																	},
																	$$slots: { default: true }
																});

																var node_25 = $.sibling(node_23, 2);

																Item(node_25, {
																	isCommand: true,
																	value: 'manage extensions',
																	keywords: ["manage", "extension"],
																	children: ($$anchor, $$slotProps) => {
																		var fragment_21 = root_9();
																		var node_26 = $.first_child(fragment_21);

																		Logo(node_26, {
																			children: ($$anchor, $$slotProps) => {
																				HammerIcon($$anchor, {});
																			},
																			$$slots: { default: true }
																		});

																		$.next();
																		$.append($$anchor, fragment_21);
																	},
																	$$slots: { default: true }
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

				var div_1 = $.sibling(node_2, 2);
				var node_27 = $.child(div_1);

				{
					var consequent = ($$anchor) => {
						RaycastDarkIcon($$anchor, {});
					};

					var alternate = ($$anchor) => {
						RaycastLightIcon($$anchor, {});
					};

					$.if(node_27, ($$render) => {
						if (mode.current === "dark") $$render(consequent); else $$render(alternate, -1);
					});
				}

				var node_28 = $.sibling(node_27, 6);

				SubCommand(node_28, {
					get listEl() {
						return $.get(listEl);
					},

					get inputEl() {
						return $.get(inputEl);
					},

					get selectedValue() {
						return $.get(value);
					}
				});

				$.reset(div_1);
				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}