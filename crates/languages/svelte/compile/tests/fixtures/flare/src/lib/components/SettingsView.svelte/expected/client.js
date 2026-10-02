import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '$lib/components/ui/input';
import Icon from '$lib/components/Icon.svelte';
import { Checkbox } from './ui/checkbox';
import * as Select from './ui/select';
import BaseList from './BaseList.svelte';
import { Button } from './ui/button';
import path from 'path';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { appsStore } from '$lib/apps.svelte';
import PasswordInput from './PasswordInput.svelte';
import * as Tabs from '$lib/components/ui/tabs';
import AiSettingsView from './AiSettingsView.svelte';
import { viewManager } from '$lib/viewManager.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="relative"><button type="button"><div class="flex size-8 shrink-0 items-center justify-center"><!></div> <div class="flex min-w-0 flex-col"><span class="truncate text-sm font-medium"> </span> <span class="text-muted-foreground truncate text-xs"> </span></div></button></div>`);
var root_2 = $.from_html(`<span class="text-red-500">*</span>`);
var root_3 = $.from_html(`<div class="text-sm font-medium"> <!></div>`);
var root_4 = $.from_html(`<p class="text-muted-foreground text-xs"> </p>`);
var root_5 = $.from_html(`<div class="space-y-2"><!> <!> <label class="flex items-center gap-2"><!> <span class="text-sm"> </span></label></div>`);
var root_6 = $.from_html(`<div class="flex items-center gap-2"><!> <!></div>`);
var root_7 = $.from_html(`<div class="space-y-2"><div class="text-sm font-medium"> <!></div> <!> <!></div>`);
var root_8 = $.from_html(`<div class="max-w-md space-y-6"></div>`);
var root_9 = $.from_html(`<div class="flex h-full items-center justify-center"><div class="text-center"><p class="text-muted-foreground">No preferences to configure.</p></div></div>`);
var root_10 = $.from_html(`<div><div class="mb-6 flex items-start justify-between"><div><h2 class="text-lg font-medium"> </h2> <p class="text-muted-foreground mt-1 text-sm"> </p></div> <!></div> <!></div>`);
var root_11 = $.from_html(`<div class="flex h-full flex-1 items-center justify-center"><div class="text-center"><p class="text-muted-foreground">Select an item to configure its settings</p></div></div>`);
var root_12 = $.from_html(`<div class="flex w-80 flex-col border-r"><header class="mb-2 flex h-15 shrink-0 items-center border-b"><button class="hover:bg-accent mr-2 rounded p-1"><!></button> <!></header> <div class="flex-1 overflow-y-auto"><!></div></div> <div class="flex h-full flex-1 flex-col overflow-y-auto px-4"><!></div>`, 1);
var root_13 = $.from_html(`<!> <!> <!>`, 1);
var root_14 = $.from_html(`<main class="bg-background text-foreground h-screen"><!></main>`);

export default function SettingsView($$anchor, $$props) {
	$.push($$props, true);

	const pluginToSelectInSettings = $.derived(() => viewManager.pluginToSelectInSettings);
	let selectedIndex = $.state(0);
	let preferenceValues = $.state($.proxy({}));
	let searchText = $.state('');
	let activeTab = $.state('extensions');
	const apps = $.derived(() => appsStore.apps);

	$.user_effect(() => {
		// This effect syncs the local preference values with the prop.
		// It's necessary because the form is a mutable copy of the preferences
		// that needs to be reset when the selected plugin changes.
		// eslint-disable-next-line svelte/prefer-writable-derived
		$.set(preferenceValues, { ...$$props.currentPreferences }, true);
	});

	const displayItems = $.derived(() => {
		const items = [];
		const extensions = new Map();

		for (const plugin of $$props.plugins) {
			if (!extensions.has(plugin.pluginName)) {
				extensions.set(plugin.pluginName, []);
			}

			extensions.get(plugin.pluginName).push(plugin);
		}

		const lowerSearchText = $.get(searchText).toLowerCase();

		for (const [, commands] of extensions.entries()) {
			const firstCommand = commands[0];
			const hasGlobalPrefs = firstCommand.preferences && firstCommand.preferences.length > 0;
			const commandsWithPrefs = commands.filter((p) => p.commandPreferences && p.commandPreferences.length > 0);

			if (!hasGlobalPrefs && commandsWithPrefs.length === 0) continue;

			const extensionMatches = firstCommand.pluginTitle.toLowerCase().includes(lowerSearchText) || (firstCommand.description ?? '').toLowerCase().includes(lowerSearchText);
			const matchingCommands = commandsWithPrefs.filter((c) => c.title.toLowerCase().includes(lowerSearchText) || (c.description ?? '').toLowerCase().includes(lowerSearchText));

			if ($.get(searchText) && !extensionMatches && matchingCommands.length === 0) {
				continue;
			}

			items.push({
				id: firstCommand.pluginName,
				type: 'extension',
				itemType: 'item',
				data: firstCommand,
				isLastInGroup: false
			});

			const commandsToShow = extensionMatches ? commandsWithPrefs : matchingCommands;

			commandsToShow.forEach((command, index) => {
				items.push({
					id: `${command.pluginName}/${command.commandName}`,
					type: 'command',
					itemType: 'item',
					data: command,
					isLastInGroup: index === commandsToShow.length - 1
				});
			});
		}

		return items;
	});

	const selectedItem = $.derived(() => $.get(displayItems)[$.get(selectedIndex)]);

	const preferencesToShow = $.derived(() => {
		if (!$.get(selectedItem)) return [];

		return $.get(selectedItem).type === 'extension'
			? $.get(selectedItem).data.preferences ?? []
			: $.get(selectedItem).data.commandPreferences ?? [];
	});

	$.user_effect(() => {
		if ($.get(selectedItem)) {
			$$props.onGetPreferences($.get(selectedItem).data.pluginName);
		}
	});

	$.user_effect(() => {
		if ($.get(pluginToSelectInSettings)) {
			const index = $.get(displayItems).findIndex((item) => item.type === 'extension' && item.data.pluginName === $.get(pluginToSelectInSettings));

			if (index > -1) {
				$.set(selectedIndex, index, true);
			}
		}
	});

	function handleKeydown(event) {
		if (event.key === 'Escape' && !event.defaultPrevented) {
			event.preventDefault();
			$$props.onBack();
		}
	}

	function handleSave() {
		if ($.get(selectedItem)) {
			$$props.onSavePreferences($.get(selectedItem).data.pluginName, $.get(preferenceValues));
		}
	}

	function handlePreferenceChange(prefName, value) {
		const newValues = { ...$.get(preferenceValues) };

		newValues[prefName] = value;
		$.set(preferenceValues, newValues, true);
	}

	function getPreferenceValue(pref) {
		return $.get(preferenceValues)[pref.name] ?? pref.default ?? '';
	}

	async function browse(type, prefName) {
		const result = await openDialog({ directory: type === 'directory', multiple: false });

		if (typeof result === 'string') {
			handlePreferenceChange(prefName, result);
		}
	}

	var main = root_14();

	$.event('keydown', $.window, handleKeydown);

	var node = $.child(main);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			class: 'h-full pt-2',
			get value() {
				return $.get(activeTab);
			},

			set value($$value) {
				$.set(activeTab, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_13();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						class: 'mx-auto',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'extensions',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Extensions');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'ai',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('AI');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'ai',
						children: ($$anchor, $$slotProps) => {
							AiSettingsView($$anchor, {});
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'extensions',
						class: 'flex h-full',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_12();
							var div = $.first_child(fragment_3);
							var header = $.child(div);
							var button = $.child(header);
							var node_6 = $.child(button);

							Icon(node_6, { icon: 'chevron-left-16', class: 'size-4' });
							$.reset(button);

							var node_7 = $.sibling(button, 2);

							Input(node_7, {
								class: 'rounded-none border-none !bg-transparent',
								placeholder: 'Filter by name...',
								get value() {
									return $.get(searchText);
								},

								set value($$value) {
									$.set(searchText, $$value, true);
								}
							});

							$.reset(header);

							var div_1 = $.sibling(header, 2);
							var node_8 = $.child(div_1);

							{
								const itemSnippet = ($$anchor, $$arg0) => {
									let item = () => ($$arg0?.()).item;
									let isSelected = () => ($$arg0?.()).isSelected;
									let onclick = () => ($$arg0?.()).onclick;
									const assetsPath = $.derived(() => path.dirname(item().data.pluginPath) + '/assets');
									var div_2 = root_1();
									var button_1 = $.child(div_2);
									let classes;
									var div_3 = $.child(button_1);
									var node_9 = $.child(div_3);

									{
										let $0 = $.derived(() => item().data.icon || 'app-window-16');

										Icon(node_9, {
											get icon() {
												return $.get($0);
											},

											get assetsPath() {
												return $.get(assetsPath);
											},
											class: 'size-5'
										});
									}

									$.reset(div_3);

									var div_4 = $.sibling(div_3, 2);
									var span = $.child(div_4);
									var text_2 = $.only_child(span, true);
									var span_1 = $.sibling(span, 2);
									var text_3 = $.only_child(span_1, true);

									$.reset(div_4);
									$.reset(button_1);
									$.reset(div_2);

									$.template_effect(() => {
										classes = $.set_class(button_1, 1, 'hover:bg-accent/50 flex w-full items-center gap-3 py-3 text-left', null, classes, {
											'bg-accent': isSelected(),
											'pl-4': item().type === 'extension',
											'pl-12': item().type === 'command'
										});

										$.set_text(text_2, item().type === 'extension' ? item().data.pluginTitle : item().data.title);
										$.set_text(text_3, item().type === 'extension' ? 'Extension' : 'Command');
									});

									$.delegated('click', button_1, function (...$$args) {
										onclick()?.apply(this, $$args);
									});

									$.append($$anchor, div_2);
								};

								BaseList(node_8, {
									get items() {
										return $.get(displayItems);
									},
									onenter: () => {},
									get selectedIndex() {
										return $.get(selectedIndex);
									},

									set selectedIndex($$value) {
										$.set(selectedIndex, $$value, true);
									},
									itemSnippet,
									$$slots: { itemSnippet: true }
								});
							}

							$.reset(div_1);
							$.reset(div);

							var div_5 = $.sibling(div, 2);
							var node_10 = $.child(div_5);

							{
								var consequent_12 = ($$anchor) => {
									var div_6 = root_10();
									var div_7 = $.child(div_6);
									var div_8 = $.child(div_7);
									var h2 = $.child(div_8);
									var text_4 = $.only_child(h2, true);
									var p_1 = $.sibling(h2, 2);
									var text_5 = $.only_child(p_1, true);

									$.reset(div_8);

									var node_11 = $.sibling(div_8, 2);

									Button(node_11, {
										onclick: handleSave,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Save');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									$.reset(div_7);

									var node_12 = $.sibling(div_7, 2);

									{
										var consequent_11 = ($$anchor) => {
											var div_9 = root_8();

											$.each(div_9, 21, () => $.get(preferencesToShow), (pref) => pref.name, ($$anchor, pref) => {
												var fragment_4 = $.comment();
												var node_13 = $.first_child(fragment_4);

												{
													var consequent_3 = ($$anchor) => {
														var div_10 = root_5();
														var node_14 = $.child(div_10);

														{
															var consequent_1 = ($$anchor) => {
																var div_11 = root_3();
																var text_7 = $.child(div_11);
																var node_15 = $.sibling(text_7);

																{
																	var consequent = ($$anchor) => {
																		var span_2 = root_2();

																		$.append($$anchor, span_2);
																	};

																	$.if(node_15, ($$render) => {
																		if ($.get(pref).required) $$render(consequent);
																	});
																}

																$.reset(div_11);
																$.template_effect(() => $.set_text(text_7, `${$.get(pref).title ?? ''} `));
																$.append($$anchor, div_11);
															};

															$.if(node_14, ($$render) => {
																if ($.get(pref).title) $$render(consequent_1);
															});
														}

														var node_16 = $.sibling(node_14, 2);

														{
															var consequent_2 = ($$anchor) => {
																var p_2 = root_4();
																var text_8 = $.only_child(p_2, true);

																$.template_effect(() => $.set_text(text_8, $.get(pref).description));
																$.append($$anchor, p_2);
															};

															$.if(node_16, ($$render) => {
																if ($.get(pref).description) $$render(consequent_2);
															});
														}

														var label = $.sibling(node_16, 2);
														var node_17 = $.child(label);

														{
															let $0 = $.derived(() => getPreferenceValue($.get(pref)));

															Checkbox(node_17, {
																get checked() {
																	return $.get($0);
																},
																onCheckedChange: (checked) => handlePreferenceChange($.get(pref).name, checked)
															});
														}

														var span_3 = $.sibling(node_17, 2);
														var text_9 = $.only_child(span_3, true);

														$.reset(label);
														$.reset(div_10);
														$.template_effect(() => $.set_text(text_9, $.get(pref).label));
														$.append($$anchor, div_10);
													};

													var alternate = ($$anchor) => {
														var div_12 = root_7();
														var div_13 = $.child(div_12);
														var text_10 = $.child(div_13);
														var node_18 = $.sibling(text_10);

														{
															var consequent_4 = ($$anchor) => {
																var span_4 = root_2();

																$.append($$anchor, span_4);
															};

															$.if(node_18, ($$render) => {
																if ($.get(pref).required) $$render(consequent_4);
															});
														}

														$.reset(div_13);

														var node_19 = $.sibling(div_13, 2);

														{
															var consequent_5 = ($$anchor) => {
																var p_3 = root_4();
																var text_11 = $.only_child(p_3, true);

																$.template_effect(() => $.set_text(text_11, $.get(pref).description));
																$.append($$anchor, p_3);
															};

															$.if(node_19, ($$render) => {
																if ($.get(pref).description) $$render(consequent_5);
															});
														}

														var node_20 = $.sibling(node_19, 2);

														{
															var consequent_6 = ($$anchor) => {
																{
																	let $0 = $.derived(() => getPreferenceValue($.get(pref)));

																	Input($$anchor, {
																		get value() {
																			return $.get($0);
																		},
																		onchange: (e) => handlePreferenceChange($.get(pref).name, e.target?.value),
																		get placeholder() {
																			return $.get(pref).default;
																		}
																	});
																}
															};

															var consequent_7 = ($$anchor) => {
																{
																	let $0 = $.derived(() => getPreferenceValue($.get(pref)));

																	PasswordInput($$anchor, {
																		get value() {
																			return $.get($0);
																		},
																		onchange: (e) => handlePreferenceChange($.get(pref).name, e.target?.value),
																		placeholder: '••••••••••••'
																	});
																}
															};

															var consequent_8 = ($$anchor) => {
																var fragment_7 = $.comment();
																var node_21 = $.first_child(fragment_7);

																{
																	let $0 = $.derived(() => getPreferenceValue($.get(pref)));

																	$.component(node_21, () => Select.Root, ($$anchor, Select_Root) => {
																		Select_Root($$anchor, {
																			get value() {
																				return $.get($0);
																			},
																			onValueChange: (value) => handlePreferenceChange($.get(pref).name, value),
																			type: 'single',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_8 = root();
																				var node_22 = $.first_child(fragment_8);

																				$.component(node_22, () => Select.Trigger, ($$anchor, Select_Trigger) => {
																					Select_Trigger($$anchor, {
																						class: 'bg-background border-border w-full rounded border px-3 py-2 text-sm',
																						children: ($$anchor, $$slotProps) => {
																							const preference = $.derived(() => $.get(pref).data.find((option) => option.value === getPreferenceValue($.get(pref))));

																							$.next();

																							var text_12 = $.text();

																							$.template_effect(() => $.set_text(text_12, $.get(preference)?.title ?? $.get(pref).default));
																							$.append($$anchor, text_12);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_23 = $.sibling(node_22, 2);

																				$.component(node_23, () => Select.Content, ($$anchor, Select_Content) => {
																					Select_Content($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_10 = $.comment();
																							var node_24 = $.first_child(fragment_10);

																							$.each(node_24, 17, () => $.get(pref).data, (option) => option.value, ($$anchor, option) => {
																								var fragment_11 = $.comment();
																								var node_25 = $.first_child(fragment_11);

																								$.component(node_25, () => Select.Item, ($$anchor, Select_Item) => {
																									Select_Item($$anchor, {
																										get value() {
																											return $.get(option).value;
																										},

																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_13 = $.text();

																											$.template_effect(() => $.set_text(text_13, $.get(option).title));
																											$.append($$anchor, text_13);
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

																				$.append($$anchor, fragment_8);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																$.append($$anchor, fragment_7);
															};

															var consequent_9 = ($$anchor) => {
																var fragment_13 = $.comment();
																var node_26 = $.first_child(fragment_13);

																{
																	let $0 = $.derived(() => getPreferenceValue($.get(pref)) || undefined);

																	$.component(node_26, () => Select.Root, ($$anchor, Select_Root_1) => {
																		Select_Root_1($$anchor, {
																			get value() {
																				return $.get($0);
																			},
																			onValueChange: (value) => handlePreferenceChange($.get(pref).name, value),
																			type: 'single',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_14 = root();
																				var node_27 = $.first_child(fragment_14);

																				$.component(node_27, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
																					Select_Trigger_1($$anchor, {
																						class: 'w-full',
																						children: ($$anchor, $$slotProps) => {
																							const selectedApp = $.derived(() => $.get(apps).find((a) => a.exec === getPreferenceValue($.get(pref))));

																							$.next();

																							var text_14 = $.text();

																							$.template_effect(() => $.set_text(text_14, $.get(selectedApp)?.name ?? 'Select Application'));
																							$.append($$anchor, text_14);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_28 = $.sibling(node_27, 2);

																				$.component(node_28, () => Select.Content, ($$anchor, Select_Content_1) => {
																					Select_Content_1($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_16 = $.comment();
																							var node_29 = $.first_child(fragment_16);

																							$.each(node_29, 17, () => $.get(apps), (app) => app.exec, ($$anchor, app) => {
																								var fragment_17 = $.comment();
																								var node_30 = $.first_child(fragment_17);

																								$.component(node_30, () => Select.Item, ($$anchor, Select_Item_1) => {
																									Select_Item_1($$anchor, {
																										get value() {
																											return $.get(app).exec;
																										},

																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_15 = $.text();

																											$.template_effect(() => $.set_text(text_15, $.get(app).name));
																											$.append($$anchor, text_15);
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

																				$.append($$anchor, fragment_14);
																			},
																			$$slots: { default: true }
																		});
																	});
																}

																$.append($$anchor, fragment_13);
															};

															var consequent_10 = ($$anchor) => {
																var div_14 = root_6();
																var node_31 = $.child(div_14);

																{
																	let $0 = $.derived(() => getPreferenceValue($.get(pref)));

																	Input(node_31, {
																		get value() {
																			return $.get($0);
																		},
																		onchange: (e) => handlePreferenceChange($.get(pref).name, e.target?.value),
																		get placeholder() {
																			return $.get(pref).default;
																		},
																		class: 'flex-grow'
																	});
																}

																var node_32 = $.sibling(node_31, 2);

																Button(node_32, {
																	variant: 'outline',
																	onclick: () => browse($.get(pref).type, $.get(pref).name),
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_16 = $.text('Browse...');

																		$.append($$anchor, text_16);
																	},
																	$$slots: { default: true }
																});

																$.reset(div_14);
																$.append($$anchor, div_14);
															};

															$.if(node_20, ($$render) => {
																if ($.get(pref).type === 'textfield') $$render(consequent_6); else if ($.get(pref).type === 'password') $$render(consequent_7, 1); else if ($.get(pref).type === 'dropdown' && $.get(pref).data) $$render(consequent_8, 2); else if ($.get(pref).type === 'appPicker') $$render(consequent_9, 3); else if ($.get(pref).type === 'file' || $.get(pref).type === 'directory') $$render(consequent_10, 4);
															});
														}

														$.reset(div_12);
														$.template_effect(() => $.set_text(text_10, `${$.get(pref).title ?? ''} `));
														$.append($$anchor, div_12);
													};

													$.if(node_13, ($$render) => {
														if ($.get(pref).type === 'checkbox') $$render(consequent_3); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_4);
											});

											$.reset(div_9);
											$.append($$anchor, div_9);
										};

										var alternate_1 = ($$anchor) => {
											var div_15 = root_9();

											$.append($$anchor, div_15);
										};

										$.if(node_12, ($$render) => {
											if ($.get(preferencesToShow).length > 0) $$render(consequent_11); else $$render(alternate_1, -1);
										});
									}

									$.reset(div_6);

									$.template_effect(() => {
										$.set_text(text_4, $.get(selectedItem).type === 'extension'
											? $.get(selectedItem).data.pluginTitle
											: $.get(selectedItem).data.title);

										$.set_text(text_5, $.get(selectedItem).type === 'extension'
											? 'These settings apply to the entire extension.'
											: 'These settings apply only to this command.');
									});

									$.append($$anchor, div_6);
								};

								var alternate_2 = ($$anchor) => {
									var div_16 = root_11();

									$.append($$anchor, div_16);
								};

								$.if(node_10, ($$render) => {
									if ($.get(selectedItem)) $$render(consequent_12); else $$render(alternate_2, -1);
								});
							}

							$.reset(div_5);

							$.delegated('click', button, function (...$$args) {
								$$props.onBack?.apply(this, $$args);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(main);
	$.append($$anchor, main);
	$.pop();
}

$.delegate(['click']);