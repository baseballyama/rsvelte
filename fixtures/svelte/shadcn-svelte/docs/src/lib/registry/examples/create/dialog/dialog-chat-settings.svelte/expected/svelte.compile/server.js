import * as $ from 'svelte/internal/server';
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

export default function Dialog_chat_settings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let tab = "general";
		let theme = "system";
		let accentColor = "default";
		let spokenLanguage = "en";
		let voice = "samantha";
		const themeLabel = $.derived(() => themes.find((t) => t.value === theme)?.label ?? "System");
		const accentLabel = $.derived(() => accents.find((a) => a.value === accentColor)?.label ?? "Default");
		const spokenLanguageLabel = $.derived(() => spokenLanguages.find((l) => l.value === spokenLanguage)?.label ?? "English");
		const voiceLabel = $.derived(() => voices.find((v) => v.value === voice)?.label ?? "Samantha");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Chat Settings',
				class: 'items-center justify-center',
				children: ($$renderer) => {
					if (Dialog.Root) {
						$$renderer.push('<!--[-->');

						Dialog.Root($$renderer, {
							children: ($$renderer) => {
								{
									function child($$renderer, { props }) {
										Button($$renderer, $.spread_props([
											{ variant: 'outline' },
											props,
											{
												children: ($$renderer) => {
													$$renderer.push(`<!---->Chat Settings`);
												},
												$$slots: { default: true }
											}
										]));
									}

									if (Dialog.Trigger) {
										$$renderer.push('<!--[-->');
										Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(` `);

								if (Dialog.Content) {
									$$renderer.push('<!--[-->');

									Dialog.Content($$renderer, {
										class: 'min-w-md',
										children: ($$renderer) => {
											if (Dialog.Header) {
												$$renderer.push('<!--[-->');

												Dialog.Header($$renderer, {
													children: ($$renderer) => {
														if (Dialog.Title) {
															$$renderer.push('<!--[-->');

															Dialog.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Chat Settings`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Dialog.Description) {
															$$renderer.push('<!--[-->');

															Dialog.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Customize your chat settings: theme, accent color, spoken language, voice, personality,
					and custom instructions.`);
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

											$$renderer.push(` <div class="flex flex-col gap-4">`);

											if (NativeSelect.Root) {
												$$renderer.push('<!--[-->');

												NativeSelect.Root($$renderer, {
													class: 'w-full md:hidden',
													get value() {
														return tab;
													},

													set value($$value) {
														tab = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (NativeSelect.Option) {
															$$renderer.push('<!--[-->');

															NativeSelect.Option($$renderer, {
																value: 'general',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->General`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (NativeSelect.Option) {
															$$renderer.push('<!--[-->');

															NativeSelect.Option($$renderer, {
																value: 'notifications',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Notifications`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (NativeSelect.Option) {
															$$renderer.push('<!--[-->');

															NativeSelect.Option($$renderer, {
																value: 'personalization',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Personalization`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (NativeSelect.Option) {
															$$renderer.push('<!--[-->');

															NativeSelect.Option($$renderer, {
																value: 'security',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Security`);
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

											$$renderer.push(` `);

											if (Tabs.Root) {
												$$renderer.push('<!--[-->');

												Tabs.Root($$renderer, {
													get value() {
														return tab;
													},

													set value($$value) {
														tab = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Tabs.List) {
															$$renderer.push('<!--[-->');

															Tabs.List($$renderer, {
																class: 'hidden w-full md:flex',
																children: ($$renderer) => {
																	if (Tabs.Trigger) {
																		$$renderer.push('<!--[-->');

																		Tabs.Trigger($$renderer, {
																			value: 'general',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->General`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Tabs.Trigger) {
																		$$renderer.push('<!--[-->');

																		Tabs.Trigger($$renderer, {
																			value: 'notifications',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Notifications`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Tabs.Trigger) {
																		$$renderer.push('<!--[-->');

																		Tabs.Trigger($$renderer, {
																			value: 'personalization',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Personalization`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Tabs.Trigger) {
																		$$renderer.push('<!--[-->');

																		Tabs.Trigger($$renderer, {
																			value: 'security',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Security`);
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

														$$renderer.push(` <div class="border **:data-[slot=select-trigger]:min-w-[125px] style-vega:min-h-[550px] style-vega:rounded-lg style-vega:p-6 style-nova:min-h-[460px] style-nova:rounded-lg style-nova:p-4 style-lyra:min-h-[450px] style-lyra:rounded-none style-lyra:p-4 style-maia:min-h-[550px] style-maia:rounded-xl style-maia:p-6 style-mira:min-h-[450px] style-mira:rounded-md style-mira:p-4 style-luma:min-h-[550px] style-luma:rounded-xl style-luma:p-6 style-rhea:min-h-[480px] style-rhea:rounded-2xl style-rhea:p-6">`);

														if (Tabs.Content) {
															$$renderer.push('<!--[-->');

															Tabs.Content($$renderer, {
																value: 'general',
																children: ($$renderer) => {
																	if (Field.Set) {
																		$$renderer.push('<!--[-->');

																		Field.Set($$renderer, {
																			children: ($$renderer) => {
																				if (Field.Group) {
																					$$renderer.push('<!--[-->');

																					Field.Group($$renderer, {
																						children: ($$renderer) => {
																							if (Field.Field) {
																								$$renderer.push('<!--[-->');

																								Field.Field($$renderer, {
																									orientation: 'horizontal',
																									children: ($$renderer) => {
																										if (Field.Label) {
																											$$renderer.push('<!--[-->');

																											Field.Label($$renderer, {
																												for: 'theme',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Theme`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Select.Root) {
																											$$renderer.push('<!--[-->');

																											Select.Root($$renderer, {
																												type: 'single',
																												get value() {
																													return theme;
																												},

																												set value($$value) {
																													theme = $$value;
																													$$settled = false;
																												},

																												children: ($$renderer) => {
																													if (Select.Trigger) {
																														$$renderer.push('<!--[-->');

																														Select.Trigger($$renderer, {
																															id: 'theme',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->${$.escape(themeLabel())}`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													if (Select.Content) {
																														$$renderer.push('<!--[-->');

																														Select.Content($$renderer, {
																															align: 'end',
																															children: ($$renderer) => {
																																if (Select.Group) {
																																	$$renderer.push('<!--[-->');

																																	Select.Group($$renderer, {
																																		children: ($$renderer) => {
																																			$$renderer.push(`<!--[-->`);

																																			const each_array = $.ensure_array_like(themes);

																																			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																																				let themeItem = each_array[$$index];

																																				if (Select.Item) {
																																					$$renderer.push('<!--[-->');

																																					Select.Item($$renderer, {
																																						value: themeItem.value,
																																						children: ($$renderer) => {
																																							$$renderer.push(`<!---->${$.escape(themeItem.label)}`);
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

																							$$renderer.push(` `);

																							if (Field.Separator) {
																								$$renderer.push('<!--[-->');
																								Field.Separator($$renderer, {});
																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Field.Field) {
																								$$renderer.push('<!--[-->');

																								Field.Field($$renderer, {
																									orientation: 'horizontal',
																									children: ($$renderer) => {
																										if (Field.Label) {
																											$$renderer.push('<!--[-->');

																											Field.Label($$renderer, {
																												for: 'accent-color',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Accent Color`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Select.Root) {
																											$$renderer.push('<!--[-->');

																											Select.Root($$renderer, {
																												type: 'single',
																												get value() {
																													return accentColor;
																												},

																												set value($$value) {
																													accentColor = $$value;
																													$$settled = false;
																												},

																												children: ($$renderer) => {
																													if (Select.Trigger) {
																														$$renderer.push('<!--[-->');

																														Select.Trigger($$renderer, {
																															id: 'accent-color',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->${$.escape(accentLabel())}`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													if (Select.Content) {
																														$$renderer.push('<!--[-->');

																														Select.Content($$renderer, {
																															align: 'end',
																															children: ($$renderer) => {
																																if (Select.Group) {
																																	$$renderer.push('<!--[-->');

																																	Select.Group($$renderer, {
																																		children: ($$renderer) => {
																																			$$renderer.push(`<!--[-->`);

																																			const each_array_1 = $.ensure_array_like(accents);

																																			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																																				let accent = each_array_1[$$index_1];

																																				if (Select.Item) {
																																					$$renderer.push('<!--[-->');

																																					Select.Item($$renderer, {
																																						value: accent.value,
																																						children: ($$renderer) => {
																																							$$renderer.push(`<!---->${$.escape(accent.label)}`);
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

																							$$renderer.push(` `);

																							if (Field.Separator) {
																								$$renderer.push('<!--[-->');
																								Field.Separator($$renderer, {});
																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Field.Field) {
																								$$renderer.push('<!--[-->');

																								Field.Field($$renderer, {
																									orientation: 'responsive',
																									children: ($$renderer) => {
																										if (Field.Content) {
																											$$renderer.push('<!--[-->');

																											Field.Content($$renderer, {
																												children: ($$renderer) => {
																													if (Field.Label) {
																														$$renderer.push('<!--[-->');

																														Field.Label($$renderer, {
																															for: 'spoken-language',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Spoken Language`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													if (Field.Description) {
																														$$renderer.push('<!--[-->');

																														Field.Description($$renderer, {
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->For best results, select the language you mainly speak. If it's not
												listed, it may still be supported via auto-detection.`);
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

																										$$renderer.push(` `);

																										if (Select.Root) {
																											$$renderer.push('<!--[-->');

																											Select.Root($$renderer, {
																												type: 'single',
																												get value() {
																													return spokenLanguage;
																												},

																												set value($$value) {
																													spokenLanguage = $$value;
																													$$settled = false;
																												},

																												children: ($$renderer) => {
																													if (Select.Trigger) {
																														$$renderer.push('<!--[-->');

																														Select.Trigger($$renderer, {
																															id: 'spoken-language',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->${$.escape(spokenLanguageLabel())}`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													if (Select.Content) {
																														$$renderer.push('<!--[-->');

																														Select.Content($$renderer, {
																															align: 'end',
																															children: ($$renderer) => {
																																if (Select.Group) {
																																	$$renderer.push('<!--[-->');

																																	Select.Group($$renderer, {
																																		children: ($$renderer) => {
																																			$$renderer.push(`<!--[-->`);

																																			const each_array_2 = $.ensure_array_like(spokenLanguages);

																																			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																																				let language = each_array_2[$$index_2];

																																				if (Select.Item) {
																																					$$renderer.push('<!--[-->');

																																					Select.Item($$renderer, {
																																						value: language.value,
																																						children: ($$renderer) => {
																																							$$renderer.push(`<!---->${$.escape(language.label)}`);
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

																							$$renderer.push(` `);

																							if (Field.Separator) {
																								$$renderer.push('<!--[-->');
																								Field.Separator($$renderer, {});
																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Field.Field) {
																								$$renderer.push('<!--[-->');

																								Field.Field($$renderer, {
																									orientation: 'horizontal',
																									children: ($$renderer) => {
																										if (Field.Label) {
																											$$renderer.push('<!--[-->');

																											Field.Label($$renderer, {
																												for: 'voice',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Voice`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Select.Root) {
																											$$renderer.push('<!--[-->');

																											Select.Root($$renderer, {
																												type: 'single',
																												get value() {
																													return voice;
																												},

																												set value($$value) {
																													voice = $$value;
																													$$settled = false;
																												},

																												children: ($$renderer) => {
																													if (Select.Trigger) {
																														$$renderer.push('<!--[-->');

																														Select.Trigger($$renderer, {
																															id: 'voice',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->${$.escape(voiceLabel())}`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													if (Select.Content) {
																														$$renderer.push('<!--[-->');

																														Select.Content($$renderer, {
																															align: 'end',
																															children: ($$renderer) => {
																																if (Select.Group) {
																																	$$renderer.push('<!--[-->');

																																	Select.Group($$renderer, {
																																		children: ($$renderer) => {
																																			$$renderer.push(`<!--[-->`);

																																			const each_array_3 = $.ensure_array_like(voices);

																																			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																																				let voiceItem = each_array_3[$$index_3];

																																				if (Select.Item) {
																																					$$renderer.push('<!--[-->');

																																					Select.Item($$renderer, {
																																						value: voiceItem.value,
																																						children: ($$renderer) => {
																																							$$renderer.push(`<!---->${$.escape(voiceItem.label)}`);
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

														$$renderer.push(` `);

														if (Tabs.Content) {
															$$renderer.push('<!--[-->');

															Tabs.Content($$renderer, {
																value: 'notifications',
																children: ($$renderer) => {
																	if (Field.Group) {
																		$$renderer.push('<!--[-->');

																		Field.Group($$renderer, {
																			children: ($$renderer) => {
																				if (Field.Set) {
																					$$renderer.push('<!--[-->');

																					Field.Set($$renderer, {
																						children: ($$renderer) => {
																							if (Field.Label) {
																								$$renderer.push('<!--[-->');

																								Field.Label($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Responses`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Field.Description) {
																								$$renderer.push('<!--[-->');

																								Field.Description($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Get notified when ChatGPT responds to requests that take time, like research or
										image generation.`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Field.Group) {
																								$$renderer.push('<!--[-->');

																								Field.Group($$renderer, {
																									'data-slot': 'checkbox-group',
																									children: ($$renderer) => {
																										if (Field.Field) {
																											$$renderer.push('<!--[-->');

																											Field.Field($$renderer, {
																												orientation: 'horizontal',
																												children: ($$renderer) => {
																													Checkbox($$renderer, { id: 'push', checked: true, disabled: true });
																													$$renderer.push(`<!----> `);

																													if (Field.Label) {
																														$$renderer.push('<!--[-->');

																														Field.Label($$renderer, {
																															for: 'push',
																															class: 'font-normal',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Push notifications`);
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

																				$$renderer.push(` `);

																				if (Field.Separator) {
																					$$renderer.push('<!--[-->');
																					Field.Separator($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Field.Set) {
																					$$renderer.push('<!--[-->');

																					Field.Set($$renderer, {
																						children: ($$renderer) => {
																							if (Field.Label) {
																								$$renderer.push('<!--[-->');

																								Field.Label($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Tasks`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Field.Description) {
																								$$renderer.push('<!--[-->');

																								Field.Description($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Get notified when tasks you've created have updates. <a href="#/">Manage tasks</a>`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Field.Group) {
																								$$renderer.push('<!--[-->');

																								Field.Group($$renderer, {
																									'data-slot': 'checkbox-group',
																									children: ($$renderer) => {
																										if (Field.Field) {
																											$$renderer.push('<!--[-->');

																											Field.Field($$renderer, {
																												orientation: 'horizontal',
																												children: ($$renderer) => {
																													Checkbox($$renderer, { id: 'push-tasks' });
																													$$renderer.push(`<!----> `);

																													if (Field.Label) {
																														$$renderer.push('<!--[-->');

																														Field.Label($$renderer, {
																															for: 'push-tasks',
																															class: 'font-normal',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Push notifications`);
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

																										$$renderer.push(` `);

																										if (Field.Field) {
																											$$renderer.push('<!--[-->');

																											Field.Field($$renderer, {
																												orientation: 'horizontal',
																												children: ($$renderer) => {
																													Checkbox($$renderer, { id: 'email-tasks' });
																													$$renderer.push(`<!----> `);

																													if (Field.Label) {
																														$$renderer.push('<!--[-->');

																														Field.Label($$renderer, {
																															for: 'email-tasks',
																															class: 'font-normal',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Email notifications`);
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

														$$renderer.push(` `);

														if (Tabs.Content) {
															$$renderer.push('<!--[-->');

															Tabs.Content($$renderer, {
																value: 'personalization',
																children: ($$renderer) => {
																	if (Field.Group) {
																		$$renderer.push('<!--[-->');

																		Field.Group($$renderer, {
																			children: ($$renderer) => {
																				if (Field.Field) {
																					$$renderer.push('<!--[-->');

																					Field.Field($$renderer, {
																						orientation: 'responsive',
																						children: ($$renderer) => {
																							if (Field.Label) {
																								$$renderer.push('<!--[-->');

																								Field.Label($$renderer, {
																									for: 'nickname',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Nickname`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (InputGroup.Root) {
																								$$renderer.push('<!--[-->');

																								InputGroup.Root($$renderer, {
																									children: ($$renderer) => {
																										if (InputGroup.Input) {
																											$$renderer.push('<!--[-->');

																											InputGroup.Input($$renderer, {
																												id: 'nickname',
																												placeholder: 'Broski',
																												class: '@md/field-group:max-w-[200px]'
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (InputGroup.Addon) {
																											$$renderer.push('<!--[-->');

																											InputGroup.Addon($$renderer, {
																												align: 'inline-end',
																												children: ($$renderer) => {
																													if (Tooltip.Root) {
																														$$renderer.push('<!--[-->');

																														Tooltip.Root($$renderer, {
																															children: ($$renderer) => {
																																{
																																	function child($$renderer, { props }) {
																																		if (InputGroup.Button) {
																																			$$renderer.push('<!--[-->');

																																			InputGroup.Button($$renderer, $.spread_props([
																																				{ size: 'icon-xs' },
																																				props,
																																				{
																																					children: ($$renderer) => {
																																						IconPlaceholder($$renderer, {
																																							lucide: 'InfoIcon',
																																							tabler: 'IconInfoCircle',
																																							hugeicons: 'AlertCircleIcon',
																																							phosphor: 'InfoIcon',
																																							remixicon: 'RiInformationLine'
																																						});
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

																																	if (Tooltip.Trigger) {
																																		$$renderer.push('<!--[-->');
																																		Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
																																		$$renderer.push('<!--]-->');
																																	} else {
																																		$$renderer.push('<!--[!-->');
																																		$$renderer.push('<!--]-->');
																																	}
																																}

																																$$renderer.push(` `);

																																if (Tooltip.Content) {
																																	$$renderer.push('<!--[-->');

																																	Tooltip.Content($$renderer, {
																																		class: 'flex items-center gap-2',
																																		children: ($$renderer) => {
																																			$$renderer.push(`<!---->Used to identify you in the chat. `);

																																			Kbd($$renderer, {
																																				children: ($$renderer) => {
																																					$$renderer.push(`<!---->N`);
																																				},
																																				$$slots: { default: true }
																																			});

																																			$$renderer.push(`<!---->`);
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
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Field.Separator) {
																					$$renderer.push('<!--[-->');
																					Field.Separator($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Field.Field) {
																					$$renderer.push('<!--[-->');

																					Field.Field($$renderer, {
																						orientation: 'responsive',
																						class: '@md/field-group:flex-col @2xl/field-group:flex-row',
																						children: ($$renderer) => {
																							if (Field.Content) {
																								$$renderer.push('<!--[-->');

																								Field.Content($$renderer, {
																									children: ($$renderer) => {
																										if (Field.Label) {
																											$$renderer.push('<!--[-->');

																											Field.Label($$renderer, {
																												for: 'about',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->More about you`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Field.Description) {
																											$$renderer.push('<!--[-->');

																											Field.Description($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Tell us more about yourself. This will be used to help us personalize your
											experience.`);
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

																							$$renderer.push(` `);

																							Textarea($$renderer, {
																								id: 'about',
																								placeholder: 'I\'m a software engineer...',
																								class: 'min-h-[120px] @md/field-group:min-w-full @2xl/field-group:min-w-[300px]'
																							});

																							$$renderer.push(`<!---->`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Field.Separator) {
																					$$renderer.push('<!--[-->');
																					Field.Separator($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Field.Label) {
																					$$renderer.push('<!--[-->');

																					Field.Label($$renderer, {
																						children: ($$renderer) => {
																							if (Field.Field) {
																								$$renderer.push('<!--[-->');

																								Field.Field($$renderer, {
																									orientation: 'horizontal',
																									children: ($$renderer) => {
																										if (Field.Content) {
																											$$renderer.push('<!--[-->');

																											Field.Content($$renderer, {
																												children: ($$renderer) => {
																													if (Field.Label) {
																														$$renderer.push('<!--[-->');

																														Field.Label($$renderer, {
																															for: 'customization',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Enable customizations`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													if (Field.Description) {
																														$$renderer.push('<!--[-->');

																														Field.Description($$renderer, {
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Enable customizations to make ChatGPT more personalized.`);
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

																										$$renderer.push(` `);
																										Switch($$renderer, { id: 'customization', checked: true });
																										$$renderer.push(`<!---->`);
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

														$$renderer.push(` `);

														if (Tabs.Content) {
															$$renderer.push('<!--[-->');

															Tabs.Content($$renderer, {
																value: 'security',
																children: ($$renderer) => {
																	if (Field.Group) {
																		$$renderer.push('<!--[-->');

																		Field.Group($$renderer, {
																			children: ($$renderer) => {
																				if (Field.Field) {
																					$$renderer.push('<!--[-->');

																					Field.Field($$renderer, {
																						orientation: 'horizontal',
																						children: ($$renderer) => {
																							if (Field.Content) {
																								$$renderer.push('<!--[-->');

																								Field.Content($$renderer, {
																									children: ($$renderer) => {
																										if (Field.Label) {
																											$$renderer.push('<!--[-->');

																											Field.Label($$renderer, {
																												for: '2fa',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Multi-factor authentication`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Field.Description) {
																											$$renderer.push('<!--[-->');

																											Field.Description($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Enable multi-factor authentication to secure your account. If you do not have
											a two-factor authentication device, you can use a one-time code sent to your
											email.`);
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

																							$$renderer.push(` `);
																							Switch($$renderer, { id: '2fa' });
																							$$renderer.push(`<!---->`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Field.Separator) {
																					$$renderer.push('<!--[-->');
																					Field.Separator($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Field.Field) {
																					$$renderer.push('<!--[-->');

																					Field.Field($$renderer, {
																						orientation: 'horizontal',
																						children: ($$renderer) => {
																							if (Field.Content) {
																								$$renderer.push('<!--[-->');

																								Field.Content($$renderer, {
																									children: ($$renderer) => {
																										if (Field.Title) {
																											$$renderer.push('<!--[-->');

																											Field.Title($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Log out`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Field.Description) {
																											$$renderer.push('<!--[-->');

																											Field.Description($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Log out of your account on this device.`);
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

																							$$renderer.push(` `);

																							Button($$renderer, {
																								variant: 'outline',
																								size: 'sm',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Log Out`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push(`<!---->`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Field.Separator) {
																					$$renderer.push('<!--[-->');
																					Field.Separator($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Field.Field) {
																					$$renderer.push('<!--[-->');

																					Field.Field($$renderer, {
																						orientation: 'horizontal',
																						children: ($$renderer) => {
																							if (Field.Content) {
																								$$renderer.push('<!--[-->');

																								Field.Content($$renderer, {
																									children: ($$renderer) => {
																										if (Field.Title) {
																											$$renderer.push('<!--[-->');

																											Field.Title($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Log out of all devices`);
																												},
																												$$slots: { default: true }
																											});

																											$$renderer.push('<!--]-->');
																										} else {
																											$$renderer.push('<!--[!-->');
																											$$renderer.push('<!--]-->');
																										}

																										$$renderer.push(` `);

																										if (Field.Description) {
																											$$renderer.push('<!--[-->');

																											Field.Description($$renderer, {
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->This will log you out of all devices, including the current session. It may
											take up to 30 minutes for the changes to take effect.`);
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

																							$$renderer.push(` `);

																							Button($$renderer, {
																								variant: 'outline',
																								size: 'sm',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Log Out All`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push(`<!---->`);
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
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</div>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}