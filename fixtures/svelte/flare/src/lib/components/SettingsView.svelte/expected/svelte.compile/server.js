import * as $ from 'svelte/internal/server';
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

export default function SettingsView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			plugins,
			onBack,
			onSavePreferences,
			onGetPreferences,
			currentPreferences
		} = $$props;

		const pluginToSelectInSettings = $.derived(() => viewManager.pluginToSelectInSettings);
		let selectedIndex = 0;
		let preferenceValues = {};
		let searchText = '';
		let activeTab = 'extensions';
		const apps = $.derived(() => appsStore.apps);

		// This effect syncs the local preference values with the prop.
		// It's necessary because the form is a mutable copy of the preferences
		// that needs to be reset when the selected plugin changes.
		// eslint-disable-next-line svelte/prefer-writable-derived
		const displayItems = $.derived(() => {
			const items = [];
			const extensions = new Map();

			for (const plugin of plugins) {
				if (!extensions.has(plugin.pluginName)) {
					extensions.set(plugin.pluginName, []);
				}

				extensions.get(plugin.pluginName).push(plugin);
			}

			const lowerSearchText = searchText.toLowerCase();

			for (const [, commands] of extensions.entries()) {
				const firstCommand = commands[0];
				const hasGlobalPrefs = firstCommand.preferences && firstCommand.preferences.length > 0;
				const commandsWithPrefs = commands.filter((p) => p.commandPreferences && p.commandPreferences.length > 0);

				if (!hasGlobalPrefs && commandsWithPrefs.length === 0) continue;

				const extensionMatches = firstCommand.pluginTitle.toLowerCase().includes(lowerSearchText) || (firstCommand.description ?? '').toLowerCase().includes(lowerSearchText);
				const matchingCommands = commandsWithPrefs.filter((c) => c.title.toLowerCase().includes(lowerSearchText) || (c.description ?? '').toLowerCase().includes(lowerSearchText));

				if (searchText && !extensionMatches && matchingCommands.length === 0) {
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

		const selectedItem = $.derived(() => displayItems()[selectedIndex]);

		const preferencesToShow = $.derived(() => {
			if (!selectedItem()) return [];

			return selectedItem().type === 'extension'
				? selectedItem().data.preferences ?? []
				: selectedItem().data.commandPreferences ?? [];
		});

		function handleKeydown(event) {
			if (event.key === 'Escape' && !event.defaultPrevented) {
				event.preventDefault();
				onBack();
			}
		}

		function handleSave() {
			if (selectedItem()) {
				onSavePreferences(selectedItem().data.pluginName, preferenceValues);
			}
		}

		function handlePreferenceChange(prefName, value) {
			const newValues = { ...preferenceValues };

			newValues[prefName] = value;
			preferenceValues = newValues;
		}

		function getPreferenceValue(pref) {
			return preferenceValues[pref.name] ?? pref.default ?? '';
		}

		async function browse(type, prefName) {
			const result = await openDialog({ directory: type === 'directory', multiple: false });

			if (typeof result === 'string') {
				handlePreferenceChange(prefName, result);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<main class="bg-background text-foreground h-screen">`);

			if (Tabs.Root) {
				$$renderer.push('<!--[-->');

				Tabs.Root($$renderer, {
					class: 'h-full pt-2',
					get value() {
						return activeTab;
					},

					set value($$value) {
						activeTab = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Tabs.List) {
							$$renderer.push('<!--[-->');

							Tabs.List($$renderer, {
								class: 'mx-auto',
								children: ($$renderer) => {
									if (Tabs.Trigger) {
										$$renderer.push('<!--[-->');

										Tabs.Trigger($$renderer, {
											value: 'extensions',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Extensions`);
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
											value: 'ai',
											children: ($$renderer) => {
												$$renderer.push(`<!---->AI`);
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
								value: 'ai',
								children: ($$renderer) => {
									AiSettingsView($$renderer, {});
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
								value: 'extensions',
								class: 'flex h-full',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex w-80 flex-col border-r"><header class="mb-2 flex h-15 shrink-0 items-center border-b"><button class="hover:bg-accent mr-2 rounded p-1">`);
									Icon($$renderer, { icon: 'chevron-left-16', class: 'size-4' });
									$$renderer.push(`<!----></button> `);

									Input($$renderer, {
										class: 'rounded-none border-none !bg-transparent',
										placeholder: 'Filter by name...',
										get value() {
											return searchText;
										},

										set value($$value) {
											searchText = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></header> <div class="flex-1 overflow-y-auto">`);

									{
										function itemSnippet($$renderer, { item, isSelected, onclick }) {
											const assetsPath = path.dirname(item.data.pluginPath) + '/assets';

											$$renderer.push(`<div class="relative"><button type="button"${$.attr_class('hover:bg-accent/50 flex w-full items-center gap-3 py-3 text-left', void 0, {
												'bg-accent': isSelected,
												'pl-4': item.type === 'extension',
												'pl-12': item.type === 'command'
											})}><div class="flex size-8 shrink-0 items-center justify-center">`);

											Icon($$renderer, {
												icon: item.data.icon || 'app-window-16',
												assetsPath,
												class: 'size-5'
											});

											$$renderer.push(`<!----></div> <div class="flex min-w-0 flex-col"><span class="truncate text-sm font-medium">${$.escape(item.type === 'extension' ? item.data.pluginTitle : item.data.title)}</span> <span class="text-muted-foreground truncate text-xs">${$.escape(item.type === 'extension' ? 'Extension' : 'Command')}</span></div></button></div>`);
										}

										BaseList($$renderer, {
											items: displayItems(),
											onenter: () => {},
											get selectedIndex() {
												return selectedIndex;
											},

											set selectedIndex($$value) {
												selectedIndex = $$value;
												$$settled = false;
											},
											itemSnippet,
											$$slots: { itemSnippet: true }
										});
									}

									$$renderer.push(`<!----></div></div> <div class="flex h-full flex-1 flex-col overflow-y-auto px-4">`);

									if (selectedItem()) {
										$$renderer.push(`<!--[0--><div><div class="mb-6 flex items-start justify-between"><div><h2 class="text-lg font-medium">${$.escape(selectedItem().type === 'extension'
											? selectedItem().data.pluginTitle
											: selectedItem().data.title)}</h2> <p class="text-muted-foreground mt-1 text-sm">${$.escape(selectedItem().type === 'extension'
											? 'These settings apply to the entire extension.'
											: 'These settings apply only to this command.')}</p></div> `);

										Button($$renderer, {
											onclick: handleSave,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Save`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div> `);

										if (preferencesToShow().length > 0) {
											$$renderer.push(`<!--[0--><div class="max-w-md space-y-6"><!--[-->`);

											const each_array = $.ensure_array_like(preferencesToShow());

											for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
												let pref = each_array[$$index_2];

												if (pref.type === 'checkbox') {
													$$renderer.push(`<!--[0--><div class="space-y-2">`);

													if (pref.title) {
														$$renderer.push(`<!--[0--><div class="text-sm font-medium">${$.escape(pref.title)} `);

														if (pref.required) {
															$$renderer.push(`<!--[0--><span class="text-red-500">*</span>`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--></div>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (pref.description) {
														$$renderer.push(`<!--[0--><p class="text-muted-foreground text-xs">${$.escape(pref.description)}</p>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> <label class="flex items-center gap-2">`);

													Checkbox($$renderer, {
														checked: getPreferenceValue(pref),
														onCheckedChange: (checked) => handlePreferenceChange(pref.name, checked)
													});

													$$renderer.push(`<!----> <span class="text-sm">${$.escape(pref.label)}</span></label></div>`);
												} else {
													$$renderer.push(`<!--[-1--><div class="space-y-2"><div class="text-sm font-medium">${$.escape(pref.title)} `);

													if (pref.required) {
														$$renderer.push(`<!--[0--><span class="text-red-500">*</span>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--></div> `);

													if (pref.description) {
														$$renderer.push(`<!--[0--><p class="text-muted-foreground text-xs">${$.escape(pref.description)}</p>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (pref.type === 'textfield') {
														$$renderer.push('<!--[0-->');

														Input($$renderer, {
															value: getPreferenceValue(pref),
															onchange: (e) => handlePreferenceChange(pref.name, e.target?.value),
															placeholder: pref.default
														});
													} else if (pref.type === 'password') {
														$$renderer.push('<!--[1-->');

														PasswordInput($$renderer, {
															value: getPreferenceValue(pref),
															onchange: (e) => handlePreferenceChange(pref.name, e.target?.value),
															placeholder: '••••••••••••'
														});
													} else if (pref.type === 'dropdown' && pref.data) {
														$$renderer.push('<!--[2-->');

														if (Select.Root) {
															$$renderer.push('<!--[-->');

															Select.Root($$renderer, {
																value: getPreferenceValue(pref),
																onValueChange: (value) => handlePreferenceChange(pref.name, value),
																type: 'single',
																children: ($$renderer) => {
																	if (Select.Trigger) {
																		$$renderer.push('<!--[-->');

																		Select.Trigger($$renderer, {
																			class: 'bg-background border-border w-full rounded border px-3 py-2 text-sm',
																			children: ($$renderer) => {
																				const preference = pref.data.find((option) => option.value === getPreferenceValue(pref));

																				$$renderer.push(`<!---->${$.escape(preference?.title ?? pref.default)}`);
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
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_1 = $.ensure_array_like(pref.data);

																				for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																					let option = each_array_1[$$index];

																					if (Select.Item) {
																						$$renderer.push('<!--[-->');

																						Select.Item($$renderer, {
																							value: option.value,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(option.title)}`);
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
													} else if (pref.type === 'appPicker') {
														$$renderer.push('<!--[3-->');

														if (Select.Root) {
															$$renderer.push('<!--[-->');

															Select.Root($$renderer, {
																value: getPreferenceValue(pref) || undefined,
																onValueChange: (value) => handlePreferenceChange(pref.name, value),
																type: 'single',
																children: ($$renderer) => {
																	if (Select.Trigger) {
																		$$renderer.push('<!--[-->');

																		Select.Trigger($$renderer, {
																			class: 'w-full',
																			children: ($$renderer) => {
																				const selectedApp = apps().find((a) => a.exec === getPreferenceValue(pref));

																				$$renderer.push(`<!---->${$.escape(selectedApp?.name ?? 'Select Application')}`);
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
																			children: ($$renderer) => {
																				$$renderer.push(`<!--[-->`);

																				const each_array_2 = $.ensure_array_like(apps());

																				for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																					let app = each_array_2[$$index_1];

																					if (Select.Item) {
																						$$renderer.push('<!--[-->');

																						Select.Item($$renderer, {
																							value: app.exec,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(app.name)}`);
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
													} else if (pref.type === 'file' || pref.type === 'directory') {
														$$renderer.push(`<!--[4--><div class="flex items-center gap-2">`);

														Input($$renderer, {
															value: getPreferenceValue(pref),
															onchange: (e) => handlePreferenceChange(pref.name, e.target?.value),
															placeholder: pref.default,
															class: 'flex-grow'
														});

														$$renderer.push(`<!----> `);

														Button($$renderer, {
															variant: 'outline',
															onclick: () => browse(pref.type, pref.name),
															children: ($$renderer) => {
																$$renderer.push(`<!---->Browse...`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----></div>`);
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--></div>`);
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]--></div>`);
										} else {
											$$renderer.push(`<!--[-1--><div class="flex h-full items-center justify-center"><div class="text-center"><p class="text-muted-foreground">No preferences to configure.</p></div></div>`);
										}

										$$renderer.push(`<!--]--></div>`);
									} else {
										$$renderer.push(`<!--[-1--><div class="flex h-full flex-1 items-center justify-center"><div class="text-center"><p class="text-muted-foreground">Select an item to configure its settings</p></div></div>`);
									}

									$$renderer.push(`<!--]--></div>`);
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

			$$renderer.push(`</main>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}