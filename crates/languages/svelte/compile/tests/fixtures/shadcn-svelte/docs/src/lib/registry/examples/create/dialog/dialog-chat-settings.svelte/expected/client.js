import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Kbd } from "$lib/registry/ui/kbd/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`Get notified when tasks you&apos;ve created have updates. <a href="#/">Manage tasks</a>`, 1);
var root_5 = $.from_html(`Used to identify you in the chat. <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<!> <div class="border **:data-[slot=select-trigger]:min-w-[125px] style-vega:min-h-[550px] style-vega:rounded-lg style-vega:p-6 style-nova:min-h-[460px] style-nova:rounded-lg style-nova:p-4 style-lyra:min-h-[450px] style-lyra:rounded-none style-lyra:p-4 style-maia:min-h-[550px] style-maia:rounded-xl style-maia:p-6 style-mira:min-h-[450px] style-mira:rounded-md style-mira:p-4 style-luma:min-h-[550px] style-luma:rounded-xl style-luma:p-6 style-rhea:min-h-[480px] style-rhea:rounded-2xl style-rhea:p-6"><!> <!> <!> <!></div>`, 1);
var root_8 = $.from_html(`<!> <div class="flex flex-col gap-4"><!> <!></div>`, 1);

export default function Dialog_chat_settings($$anchor, $$props) {
	$.push($$props, true);

	const spokenLanguages = [
		{ label: "Auto", value: "auto" },
		{ label: "English", value: "en" },
		{ label: "Spanish", value: "es" },
		{ label: "French", value: "fr" },
		{ label: "German", value: "de" },
		{ label: "Italian", value: "it" },
		{ label: "Portuguese", value: "pt" },
		{ label: "Russian", value: "ru" },
		{ label: "Chinese", value: "zh" },
		{ label: "Japanese", value: "ja" },
		{ label: "Korean", value: "ko" },
		{ label: "Arabic", value: "ar" },
		{ label: "Hindi", value: "hi" },
		{ label: "Bengali", value: "bn" },
		{ label: "Telugu", value: "te" },
		{ label: "Marathi", value: "mr" },
		{ label: "Kannada", value: "kn" },
		{ label: "Malayalam", value: "ml" }
	];

	const voices = [
		{ label: "Samantha", value: "samantha" },
		{ label: "Alex", value: "alex" },
		{ label: "Fred", value: "fred" },
		{ label: "Victoria", value: "victoria" },
		{ label: "Tom", value: "tom" },
		{ label: "Karen", value: "karen" },
		{ label: "Sam", value: "sam" },
		{ label: "Daniel", value: "daniel" }
	];

	const themes = [
		{ label: "Light", value: "light" },
		{ label: "Dark", value: "dark" },
		{ label: "System", value: "system" }
	];

	const accents = [
		{ label: "Default", value: "default" },
		{ label: "Red", value: "red" },
		{ label: "Blue", value: "blue" },
		{ label: "Green", value: "green" },
		{ label: "Purple", value: "purple" },
		{ label: "Pink", value: "pink" }
	];

	let tab = $.state("general");
	let theme = $.state("system");
	let accentColor = $.state("default");
	let spokenLanguage = $.state("en");
	let voice = $.state("samantha");
	const themeLabel = $.derived(() => themes.find((t) => t.value === $.get(theme))?.label ?? "System");
	const accentLabel = $.derived(() => accents.find((a) => a.value === $.get(accentColor))?.label ?? "Default");
	const spokenLanguageLabel = $.derived(() => spokenLanguages.find((l) => l.value === $.get(spokenLanguage))?.label ?? "English");
	const voiceLabel = $.derived(() => voices.find((v) => v.value === $.get(voice))?.label ?? "Samantha");

	Example($$anchor, {
		title: 'Chat Settings',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Chat Settings');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								class: 'min-w-md',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_8();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Chat Settings');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Customize your chat settings: theme, accent color, spoken language, voice, personality,\n					and custom instructions.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var div = $.sibling(node_3, 2);
									var node_6 = $.child(div);

									$.component(node_6, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
										NativeSelect_Root($$anchor, {
											class: 'w-full md:hidden',
											get value() {
												return $.get(tab);
											},

											set value($$value) {
												$.set(tab, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
													NativeSelect_Option($$anchor, {
														value: 'general',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('General');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
													NativeSelect_Option_1($$anchor, {
														value: 'notifications',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Notifications');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
													NativeSelect_Option_2($$anchor, {
														value: 'personalization',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Personalization');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
													NativeSelect_Option_3($$anchor, {
														value: 'security',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Security');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_6, 2);

									$.component(node_11, () => Tabs.Root, ($$anchor, Tabs_Root) => {
										Tabs_Root($$anchor, {
											get value() {
												return $.get(tab);
											},

											set value($$value) {
												$.set(tab, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_7();
												var node_12 = $.first_child(fragment_7);

												$.component(node_12, () => Tabs.List, ($$anchor, Tabs_List) => {
													Tabs_List($$anchor, {
														class: 'hidden w-full md:flex',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_1();
															var node_13 = $.first_child(fragment_8);

															$.component(node_13, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
																Tabs_Trigger($$anchor, {
																	value: 'general',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('General');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_14 = $.sibling(node_13, 2);

															$.component(node_14, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
																Tabs_Trigger_1($$anchor, {
																	value: 'notifications',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Notifications');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_15 = $.sibling(node_14, 2);

															$.component(node_15, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
																Tabs_Trigger_2($$anchor, {
																	value: 'personalization',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_9 = $.text('Personalization');

																		$.append($$anchor, text_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_16 = $.sibling(node_15, 2);

															$.component(node_16, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_3) => {
																Tabs_Trigger_3($$anchor, {
																	value: 'security',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_10 = $.text('Security');

																		$.append($$anchor, text_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var div_1 = $.sibling(node_12, 2);
												var node_17 = $.child(div_1);

												$.component(node_17, () => Tabs.Content, ($$anchor, Tabs_Content) => {
													Tabs_Content($$anchor, {
														value: 'general',
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = $.comment();
															var node_18 = $.first_child(fragment_9);

															$.component(node_18, () => Field.Set, ($$anchor, Field_Set) => {
																Field_Set($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_19 = $.first_child(fragment_10);

																		$.component(node_19, () => Field.Group, ($$anchor, Field_Group) => {
																			Field_Group($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root_2();
																					var node_20 = $.first_child(fragment_11);

																					$.component(node_20, () => Field.Field, ($$anchor, Field_Field) => {
																						Field_Field($$anchor, {
																							orientation: 'horizontal',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_12 = root();
																								var node_21 = $.first_child(fragment_12);

																								$.component(node_21, () => Field.Label, ($$anchor, Field_Label) => {
																									Field_Label($$anchor, {
																										for: 'theme',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_11 = $.text('Theme');

																											$.append($$anchor, text_11);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_22 = $.sibling(node_21, 2);

																								$.component(node_22, () => Select.Root, ($$anchor, Select_Root) => {
																									Select_Root($$anchor, {
																										type: 'single',
																										get value() {
																											return $.get(theme);
																										},

																										set value($$value) {
																											$.set(theme, $$value, true);
																										},

																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = root();
																											var node_23 = $.first_child(fragment_13);

																											$.component(node_23, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																												Select_Trigger($$anchor, {
																													id: 'theme',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_12 = $.text();

																														$.template_effect(() => $.set_text(text_12, $.get(themeLabel)));
																														$.append($$anchor, text_12);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_24 = $.sibling(node_23, 2);

																											$.component(node_24, () => Select.Content, ($$anchor, Select_Content) => {
																												Select_Content($$anchor, {
																													align: 'end',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_15 = $.comment();
																														var node_25 = $.first_child(fragment_15);

																														$.component(node_25, () => Select.Group, ($$anchor, Select_Group) => {
																															Select_Group($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_16 = $.comment();
																																	var node_26 = $.first_child(fragment_16);

																																	$.each(node_26, 17, () => themes, (themeItem) => themeItem.value, ($$anchor, themeItem) => {
																																		var fragment_17 = $.comment();
																																		var node_27 = $.first_child(fragment_17);

																																		$.component(node_27, () => Select.Item, ($$anchor, Select_Item) => {
																																			Select_Item($$anchor, {
																																				get value() {
																																					return $.get(themeItem).value;
																																				},

																																				children: ($$anchor, $$slotProps) => {
																																					$.next();

																																					var text_13 = $.text();

																																					$.template_effect(() => $.set_text(text_13, $.get(themeItem).label));
																																					$.append($$anchor, text_13);
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

																					var node_28 = $.sibling(node_20, 2);

																					$.component(node_28, () => Field.Separator, ($$anchor, Field_Separator) => {
																						Field_Separator($$anchor, {});
																					});

																					var node_29 = $.sibling(node_28, 2);

																					$.component(node_29, () => Field.Field, ($$anchor, Field_Field_1) => {
																						Field_Field_1($$anchor, {
																							orientation: 'horizontal',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_19 = root();
																								var node_30 = $.first_child(fragment_19);

																								$.component(node_30, () => Field.Label, ($$anchor, Field_Label_1) => {
																									Field_Label_1($$anchor, {
																										for: 'accent-color',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_14 = $.text('Accent Color');

																											$.append($$anchor, text_14);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_31 = $.sibling(node_30, 2);

																								$.component(node_31, () => Select.Root, ($$anchor, Select_Root_1) => {
																									Select_Root_1($$anchor, {
																										type: 'single',
																										get value() {
																											return $.get(accentColor);
																										},

																										set value($$value) {
																											$.set(accentColor, $$value, true);
																										},

																										children: ($$anchor, $$slotProps) => {
																											var fragment_20 = root();
																											var node_32 = $.first_child(fragment_20);

																											$.component(node_32, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																												Select_Trigger_1($$anchor, {
																													id: 'accent-color',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_15 = $.text();

																														$.template_effect(() => $.set_text(text_15, $.get(accentLabel)));
																														$.append($$anchor, text_15);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_33 = $.sibling(node_32, 2);

																											$.component(node_33, () => Select.Content, ($$anchor, Select_Content_1) => {
																												Select_Content_1($$anchor, {
																													align: 'end',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_22 = $.comment();
																														var node_34 = $.first_child(fragment_22);

																														$.component(node_34, () => Select.Group, ($$anchor, Select_Group_1) => {
																															Select_Group_1($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_23 = $.comment();
																																	var node_35 = $.first_child(fragment_23);

																																	$.each(node_35, 17, () => accents, (accent) => accent.value, ($$anchor, accent) => {
																																		var fragment_24 = $.comment();
																																		var node_36 = $.first_child(fragment_24);

																																		$.component(node_36, () => Select.Item, ($$anchor, Select_Item_1) => {
																																			Select_Item_1($$anchor, {
																																				get value() {
																																					return $.get(accent).value;
																																				},

																																				children: ($$anchor, $$slotProps) => {
																																					$.next();

																																					var text_16 = $.text();

																																					$.template_effect(() => $.set_text(text_16, $.get(accent).label));
																																					$.append($$anchor, text_16);
																																				},
																																				$$slots: { default: true }
																																			});
																																		});

																																		$.append($$anchor, fragment_24);
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

																											$.append($$anchor, fragment_20);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_19);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_37 = $.sibling(node_29, 2);

																					$.component(node_37, () => Field.Separator, ($$anchor, Field_Separator_1) => {
																						Field_Separator_1($$anchor, {});
																					});

																					var node_38 = $.sibling(node_37, 2);

																					$.component(node_38, () => Field.Field, ($$anchor, Field_Field_2) => {
																						Field_Field_2($$anchor, {
																							orientation: 'responsive',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_26 = root();
																								var node_39 = $.first_child(fragment_26);

																								$.component(node_39, () => Field.Content, ($$anchor, Field_Content) => {
																									Field_Content($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_27 = root();
																											var node_40 = $.first_child(fragment_27);

																											$.component(node_40, () => Field.Label, ($$anchor, Field_Label_2) => {
																												Field_Label_2($$anchor, {
																													for: 'spoken-language',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_17 = $.text('Spoken Language');

																														$.append($$anchor, text_17);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_41 = $.sibling(node_40, 2);

																											$.component(node_41, () => Field.Description, ($$anchor, Field_Description) => {
																												Field_Description($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_18 = $.text('For best results, select the language you mainly speak. If it\'s not\n												listed, it may still be supported via auto-detection.');

																														$.append($$anchor, text_18);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_27);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_42 = $.sibling(node_39, 2);

																								$.component(node_42, () => Select.Root, ($$anchor, Select_Root_2) => {
																									Select_Root_2($$anchor, {
																										type: 'single',
																										get value() {
																											return $.get(spokenLanguage);
																										},

																										set value($$value) {
																											$.set(spokenLanguage, $$value, true);
																										},

																										children: ($$anchor, $$slotProps) => {
																											var fragment_28 = root();
																											var node_43 = $.first_child(fragment_28);

																											$.component(node_43, () => Select.Trigger, ($$anchor, Select_Trigger_2) => {
																												Select_Trigger_2($$anchor, {
																													id: 'spoken-language',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_19 = $.text();

																														$.template_effect(() => $.set_text(text_19, $.get(spokenLanguageLabel)));
																														$.append($$anchor, text_19);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_44 = $.sibling(node_43, 2);

																											$.component(node_44, () => Select.Content, ($$anchor, Select_Content_2) => {
																												Select_Content_2($$anchor, {
																													align: 'end',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_30 = $.comment();
																														var node_45 = $.first_child(fragment_30);

																														$.component(node_45, () => Select.Group, ($$anchor, Select_Group_2) => {
																															Select_Group_2($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_31 = $.comment();
																																	var node_46 = $.first_child(fragment_31);

																																	$.each(node_46, 17, () => spokenLanguages, (language) => language.value, ($$anchor, language) => {
																																		var fragment_32 = $.comment();
																																		var node_47 = $.first_child(fragment_32);

																																		$.component(node_47, () => Select.Item, ($$anchor, Select_Item_2) => {
																																			Select_Item_2($$anchor, {
																																				get value() {
																																					return $.get(language).value;
																																				},

																																				children: ($$anchor, $$slotProps) => {
																																					$.next();

																																					var text_20 = $.text();

																																					$.template_effect(() => $.set_text(text_20, $.get(language).label));
																																					$.append($$anchor, text_20);
																																				},
																																				$$slots: { default: true }
																																			});
																																		});

																																		$.append($$anchor, fragment_32);
																																	});

																																	$.append($$anchor, fragment_31);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_30);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_28);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_26);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_48 = $.sibling(node_38, 2);

																					$.component(node_48, () => Field.Separator, ($$anchor, Field_Separator_2) => {
																						Field_Separator_2($$anchor, {});
																					});

																					var node_49 = $.sibling(node_48, 2);

																					$.component(node_49, () => Field.Field, ($$anchor, Field_Field_3) => {
																						Field_Field_3($$anchor, {
																							orientation: 'horizontal',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_34 = root();
																								var node_50 = $.first_child(fragment_34);

																								$.component(node_50, () => Field.Label, ($$anchor, Field_Label_3) => {
																									Field_Label_3($$anchor, {
																										for: 'voice',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_21 = $.text('Voice');

																											$.append($$anchor, text_21);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_51 = $.sibling(node_50, 2);

																								$.component(node_51, () => Select.Root, ($$anchor, Select_Root_3) => {
																									Select_Root_3($$anchor, {
																										type: 'single',
																										get value() {
																											return $.get(voice);
																										},

																										set value($$value) {
																											$.set(voice, $$value, true);
																										},

																										children: ($$anchor, $$slotProps) => {
																											var fragment_35 = root();
																											var node_52 = $.first_child(fragment_35);

																											$.component(node_52, () => Select.Trigger, ($$anchor, Select_Trigger_3) => {
																												Select_Trigger_3($$anchor, {
																													id: 'voice',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_22 = $.text();

																														$.template_effect(() => $.set_text(text_22, $.get(voiceLabel)));
																														$.append($$anchor, text_22);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_53 = $.sibling(node_52, 2);

																											$.component(node_53, () => Select.Content, ($$anchor, Select_Content_3) => {
																												Select_Content_3($$anchor, {
																													align: 'end',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_37 = $.comment();
																														var node_54 = $.first_child(fragment_37);

																														$.component(node_54, () => Select.Group, ($$anchor, Select_Group_3) => {
																															Select_Group_3($$anchor, {
																																children: ($$anchor, $$slotProps) => {
																																	var fragment_38 = $.comment();
																																	var node_55 = $.first_child(fragment_38);

																																	$.each(node_55, 17, () => voices, (voiceItem) => voiceItem.value, ($$anchor, voiceItem) => {
																																		var fragment_39 = $.comment();
																																		var node_56 = $.first_child(fragment_39);

																																		$.component(node_56, () => Select.Item, ($$anchor, Select_Item_3) => {
																																			Select_Item_3($$anchor, {
																																				get value() {
																																					return $.get(voiceItem).value;
																																				},

																																				children: ($$anchor, $$slotProps) => {
																																					$.next();

																																					var text_23 = $.text();

																																					$.template_effect(() => $.set_text(text_23, $.get(voiceItem).label));
																																					$.append($$anchor, text_23);
																																				},
																																				$$slots: { default: true }
																																			});
																																		});

																																		$.append($$anchor, fragment_39);
																																	});

																																	$.append($$anchor, fragment_38);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_37);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_35);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_34);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
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

												var node_57 = $.sibling(node_17, 2);

												$.component(node_57, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
													Tabs_Content_1($$anchor, {
														value: 'notifications',
														children: ($$anchor, $$slotProps) => {
															var fragment_41 = $.comment();
															var node_58 = $.first_child(fragment_41);

															$.component(node_58, () => Field.Group, ($$anchor, Field_Group_1) => {
																Field_Group_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_42 = root_3();
																		var node_59 = $.first_child(fragment_42);

																		$.component(node_59, () => Field.Set, ($$anchor, Field_Set_1) => {
																			Field_Set_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_43 = root_3();
																					var node_60 = $.first_child(fragment_43);

																					$.component(node_60, () => Field.Label, ($$anchor, Field_Label_4) => {
																						Field_Label_4($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_24 = $.text('Responses');

																								$.append($$anchor, text_24);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_61 = $.sibling(node_60, 2);

																					$.component(node_61, () => Field.Description, ($$anchor, Field_Description_1) => {
																						Field_Description_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_25 = $.text('Get notified when ChatGPT responds to requests that take time, like research or\n										image generation.');

																								$.append($$anchor, text_25);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_62 = $.sibling(node_61, 2);

																					$.component(node_62, () => Field.Group, ($$anchor, Field_Group_2) => {
																						Field_Group_2($$anchor, {
																							'data-slot': 'checkbox-group',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_44 = $.comment();
																								var node_63 = $.first_child(fragment_44);

																								$.component(node_63, () => Field.Field, ($$anchor, Field_Field_4) => {
																									Field_Field_4($$anchor, {
																										orientation: 'horizontal',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_45 = root();
																											var node_64 = $.first_child(fragment_45);

																											Checkbox(node_64, { id: 'push', checked: true, disabled: true });

																											var node_65 = $.sibling(node_64, 2);

																											$.component(node_65, () => Field.Label, ($$anchor, Field_Label_5) => {
																												Field_Label_5($$anchor, {
																													for: 'push',
																													class: 'font-normal',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_26 = $.text('Push notifications');

																														$.append($$anchor, text_26);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_45);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_44);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_43);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_66 = $.sibling(node_59, 2);

																		$.component(node_66, () => Field.Separator, ($$anchor, Field_Separator_3) => {
																			Field_Separator_3($$anchor, {});
																		});

																		var node_67 = $.sibling(node_66, 2);

																		$.component(node_67, () => Field.Set, ($$anchor, Field_Set_2) => {
																			Field_Set_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_46 = root_3();
																					var node_68 = $.first_child(fragment_46);

																					$.component(node_68, () => Field.Label, ($$anchor, Field_Label_6) => {
																						Field_Label_6($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_27 = $.text('Tasks');

																								$.append($$anchor, text_27);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_69 = $.sibling(node_68, 2);

																					$.component(node_69, () => Field.Description, ($$anchor, Field_Description_2) => {
																						Field_Description_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var fragment_47 = root_4();

																								$.next();
																								$.append($$anchor, fragment_47);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_70 = $.sibling(node_69, 2);

																					$.component(node_70, () => Field.Group, ($$anchor, Field_Group_3) => {
																						Field_Group_3($$anchor, {
																							'data-slot': 'checkbox-group',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_48 = root();
																								var node_71 = $.first_child(fragment_48);

																								$.component(node_71, () => Field.Field, ($$anchor, Field_Field_5) => {
																									Field_Field_5($$anchor, {
																										orientation: 'horizontal',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_49 = root();
																											var node_72 = $.first_child(fragment_49);

																											Checkbox(node_72, { id: 'push-tasks' });

																											var node_73 = $.sibling(node_72, 2);

																											$.component(node_73, () => Field.Label, ($$anchor, Field_Label_7) => {
																												Field_Label_7($$anchor, {
																													for: 'push-tasks',
																													class: 'font-normal',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_28 = $.text('Push notifications');

																														$.append($$anchor, text_28);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_49);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_74 = $.sibling(node_71, 2);

																								$.component(node_74, () => Field.Field, ($$anchor, Field_Field_6) => {
																									Field_Field_6($$anchor, {
																										orientation: 'horizontal',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_50 = root();
																											var node_75 = $.first_child(fragment_50);

																											Checkbox(node_75, { id: 'email-tasks' });

																											var node_76 = $.sibling(node_75, 2);

																											$.component(node_76, () => Field.Label, ($$anchor, Field_Label_8) => {
																												Field_Label_8($$anchor, {
																													for: 'email-tasks',
																													class: 'font-normal',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_29 = $.text('Email notifications');

																														$.append($$anchor, text_29);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_50);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_48);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_46);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_42);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_41);
														},
														$$slots: { default: true }
													});
												});

												var node_77 = $.sibling(node_57, 2);

												$.component(node_77, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
													Tabs_Content_2($$anchor, {
														value: 'personalization',
														children: ($$anchor, $$slotProps) => {
															var fragment_51 = $.comment();
															var node_78 = $.first_child(fragment_51);

															$.component(node_78, () => Field.Group, ($$anchor, Field_Group_4) => {
																Field_Group_4($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_52 = root_6();
																		var node_79 = $.first_child(fragment_52);

																		$.component(node_79, () => Field.Field, ($$anchor, Field_Field_7) => {
																			Field_Field_7($$anchor, {
																				orientation: 'responsive',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_53 = root();
																					var node_80 = $.first_child(fragment_53);

																					$.component(node_80, () => Field.Label, ($$anchor, Field_Label_9) => {
																						Field_Label_9($$anchor, {
																							for: 'nickname',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_30 = $.text('Nickname');

																								$.append($$anchor, text_30);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_81 = $.sibling(node_80, 2);

																					$.component(node_81, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
																						InputGroup_Root($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_54 = root();
																								var node_82 = $.first_child(fragment_54);

																								$.component(node_82, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																									InputGroup_Input($$anchor, {
																										id: 'nickname',
																										placeholder: 'Broski',
																										class: '@md/field-group:max-w-[200px]'
																									});
																								});

																								var node_83 = $.sibling(node_82, 2);

																								$.component(node_83, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																									InputGroup_Addon($$anchor, {
																										align: 'inline-end',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_55 = $.comment();
																											var node_84 = $.first_child(fragment_55);

																											$.component(node_84, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																												Tooltip_Root($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														var fragment_56 = root();
																														var node_85 = $.first_child(fragment_56);

																														{
																															const child = ($$anchor, $$arg0) => {
																																let props = () => ($$arg0?.()).props;
																																var fragment_57 = $.comment();
																																var node_86 = $.first_child(fragment_57);

																																$.component(node_86, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																																	InputGroup_Button($$anchor, $.spread_props({ size: 'icon-xs' }, props, {
																																		children: ($$anchor, $$slotProps) => {
																																			IconPlaceholder($$anchor, {
																																				lucide: 'InfoIcon',
																																				tabler: 'IconInfoCircle',
																																				hugeicons: 'AlertCircleIcon',
																																				phosphor: 'InfoIcon',
																																				remixicon: 'RiInformationLine'
																																			});
																																		},
																																		$$slots: { default: true }
																																	}));
																																});

																																$.append($$anchor, fragment_57);
																															};

																															$.component(node_85, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																																Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
																															});
																														}

																														var node_87 = $.sibling(node_85, 2);

																														$.component(node_87, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																															Tooltip_Content($$anchor, {
																																class: 'flex items-center gap-2',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var fragment_59 = root_5();
																																	var node_88 = $.sibling($.first_child(fragment_59));

																																	Kbd(node_88, {
																																		children: ($$anchor, $$slotProps) => {
																																			$.next();

																																			var text_31 = $.text('N');

																																			$.append($$anchor, text_31);
																																		},
																																		$$slots: { default: true }
																																	});

																																	$.append($$anchor, fragment_59);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_56);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_55);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_54);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_53);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_89 = $.sibling(node_79, 2);

																		$.component(node_89, () => Field.Separator, ($$anchor, Field_Separator_4) => {
																			Field_Separator_4($$anchor, {});
																		});

																		var node_90 = $.sibling(node_89, 2);

																		$.component(node_90, () => Field.Field, ($$anchor, Field_Field_8) => {
																			Field_Field_8($$anchor, {
																				orientation: 'responsive',
																				class: '@md/field-group:flex-col @2xl/field-group:flex-row',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_60 = root();
																					var node_91 = $.first_child(fragment_60);

																					$.component(node_91, () => Field.Content, ($$anchor, Field_Content_1) => {
																						Field_Content_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_61 = root();
																								var node_92 = $.first_child(fragment_61);

																								$.component(node_92, () => Field.Label, ($$anchor, Field_Label_10) => {
																									Field_Label_10($$anchor, {
																										for: 'about',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_32 = $.text('More about you');

																											$.append($$anchor, text_32);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_93 = $.sibling(node_92, 2);

																								$.component(node_93, () => Field.Description, ($$anchor, Field_Description_3) => {
																									Field_Description_3($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_33 = $.text('Tell us more about yourself. This will be used to help us personalize your\n											experience.');

																											$.append($$anchor, text_33);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_61);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_94 = $.sibling(node_91, 2);

																					Textarea(node_94, {
																						id: 'about',
																						placeholder: 'I\'m a software engineer...',
																						class: 'min-h-[120px] @md/field-group:min-w-full @2xl/field-group:min-w-[300px]'
																					});

																					$.append($$anchor, fragment_60);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_95 = $.sibling(node_90, 2);

																		$.component(node_95, () => Field.Separator, ($$anchor, Field_Separator_5) => {
																			Field_Separator_5($$anchor, {});
																		});

																		var node_96 = $.sibling(node_95, 2);

																		$.component(node_96, () => Field.Label, ($$anchor, Field_Label_11) => {
																			Field_Label_11($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_62 = $.comment();
																					var node_97 = $.first_child(fragment_62);

																					$.component(node_97, () => Field.Field, ($$anchor, Field_Field_9) => {
																						Field_Field_9($$anchor, {
																							orientation: 'horizontal',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_63 = root();
																								var node_98 = $.first_child(fragment_63);

																								$.component(node_98, () => Field.Content, ($$anchor, Field_Content_2) => {
																									Field_Content_2($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_64 = root();
																											var node_99 = $.first_child(fragment_64);

																											$.component(node_99, () => Field.Label, ($$anchor, Field_Label_12) => {
																												Field_Label_12($$anchor, {
																													for: 'customization',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_34 = $.text('Enable customizations');

																														$.append($$anchor, text_34);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_100 = $.sibling(node_99, 2);

																											$.component(node_100, () => Field.Description, ($$anchor, Field_Description_4) => {
																												Field_Description_4($$anchor, {
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_35 = $.text('Enable customizations to make ChatGPT more personalized.');

																														$.append($$anchor, text_35);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_64);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_101 = $.sibling(node_98, 2);

																								Switch(node_101, { id: 'customization', checked: true });
																								$.append($$anchor, fragment_63);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_62);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_52);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_51);
														},
														$$slots: { default: true }
													});
												});

												var node_102 = $.sibling(node_77, 2);

												$.component(node_102, () => Tabs.Content, ($$anchor, Tabs_Content_3) => {
													Tabs_Content_3($$anchor, {
														value: 'security',
														children: ($$anchor, $$slotProps) => {
															var fragment_65 = $.comment();
															var node_103 = $.first_child(fragment_65);

															$.component(node_103, () => Field.Group, ($$anchor, Field_Group_5) => {
																Field_Group_5($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_66 = root_6();
																		var node_104 = $.first_child(fragment_66);

																		$.component(node_104, () => Field.Field, ($$anchor, Field_Field_10) => {
																			Field_Field_10($$anchor, {
																				orientation: 'horizontal',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_67 = root();
																					var node_105 = $.first_child(fragment_67);

																					$.component(node_105, () => Field.Content, ($$anchor, Field_Content_3) => {
																						Field_Content_3($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_68 = root();
																								var node_106 = $.first_child(fragment_68);

																								$.component(node_106, () => Field.Label, ($$anchor, Field_Label_13) => {
																									Field_Label_13($$anchor, {
																										for: '2fa',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_36 = $.text('Multi-factor authentication');

																											$.append($$anchor, text_36);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_107 = $.sibling(node_106, 2);

																								$.component(node_107, () => Field.Description, ($$anchor, Field_Description_5) => {
																									Field_Description_5($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_37 = $.text('Enable multi-factor authentication to secure your account. If you do not have\n											a two-factor authentication device, you can use a one-time code sent to your\n											email.');

																											$.append($$anchor, text_37);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_68);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_108 = $.sibling(node_105, 2);

																					Switch(node_108, { id: '2fa' });
																					$.append($$anchor, fragment_67);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_109 = $.sibling(node_104, 2);

																		$.component(node_109, () => Field.Separator, ($$anchor, Field_Separator_6) => {
																			Field_Separator_6($$anchor, {});
																		});

																		var node_110 = $.sibling(node_109, 2);

																		$.component(node_110, () => Field.Field, ($$anchor, Field_Field_11) => {
																			Field_Field_11($$anchor, {
																				orientation: 'horizontal',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_69 = root();
																					var node_111 = $.first_child(fragment_69);

																					$.component(node_111, () => Field.Content, ($$anchor, Field_Content_4) => {
																						Field_Content_4($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_70 = root();
																								var node_112 = $.first_child(fragment_70);

																								$.component(node_112, () => Field.Title, ($$anchor, Field_Title) => {
																									Field_Title($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_38 = $.text('Log out');

																											$.append($$anchor, text_38);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_113 = $.sibling(node_112, 2);

																								$.component(node_113, () => Field.Description, ($$anchor, Field_Description_6) => {
																									Field_Description_6($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_39 = $.text('Log out of your account on this device.');

																											$.append($$anchor, text_39);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_70);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_114 = $.sibling(node_111, 2);

																					Button(node_114, {
																						variant: 'outline',
																						size: 'sm',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_40 = $.text('Log Out');

																							$.append($$anchor, text_40);
																						},
																						$$slots: { default: true }
																					});

																					$.append($$anchor, fragment_69);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_115 = $.sibling(node_110, 2);

																		$.component(node_115, () => Field.Separator, ($$anchor, Field_Separator_7) => {
																			Field_Separator_7($$anchor, {});
																		});

																		var node_116 = $.sibling(node_115, 2);

																		$.component(node_116, () => Field.Field, ($$anchor, Field_Field_12) => {
																			Field_Field_12($$anchor, {
																				orientation: 'horizontal',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_71 = root();
																					var node_117 = $.first_child(fragment_71);

																					$.component(node_117, () => Field.Content, ($$anchor, Field_Content_5) => {
																						Field_Content_5($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_72 = root();
																								var node_118 = $.first_child(fragment_72);

																								$.component(node_118, () => Field.Title, ($$anchor, Field_Title_1) => {
																									Field_Title_1($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_41 = $.text('Log out of all devices');

																											$.append($$anchor, text_41);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_119 = $.sibling(node_118, 2);

																								$.component(node_119, () => Field.Description, ($$anchor, Field_Description_7) => {
																									Field_Description_7($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_42 = $.text('This will log you out of all devices, including the current session. It may\n											take up to 30 minutes for the changes to take effect.');

																											$.append($$anchor, text_42);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_72);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_120 = $.sibling(node_117, 2);

																					Button(node_120, {
																						variant: 'outline',
																						size: 'sm',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_43 = $.text('Log Out All');

																							$.append($$anchor, text_43);
																						},
																						$$slots: { default: true }
																					});

																					$.append($$anchor, fragment_71);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_66);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_65);
														},
														$$slots: { default: true }
													});
												});

												$.reset(div_1);
												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div);
									$.append($$anchor, fragment_4);
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

	$.pop();
}