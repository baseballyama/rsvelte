import * as $ from 'svelte/internal/server';
import Calculator from '$lib/components/Calculator.svelte';
import BaseList from '$lib/components/BaseList.svelte';
import ListItemBase from '../nodes/shared/ListItemBase.svelte';
import path from 'path';
import { tick } from 'svelte';
import { appsStore } from '$lib/apps.svelte';
import { frecencyStore } from '$lib/frecency.svelte';
import { quicklinksStore } from '$lib/quicklinks.svelte';
import { useCommandPaletteItems, useCommandPaletteActions } from '$lib/command-palette.svelte';
import CommandPaletteActionBar from './ActionBar.svelte';
import { focusManager } from '$lib/focus.svelte';
import HeaderInput from '../HeaderInput.svelte';
import { Input } from '$lib/components/ui/input';
import MainLayout from '../layout/MainLayout.svelte';
import Header from '../layout/Header.svelte';

export default function CommandPalette($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { plugins, onRunPlugin } = $$props;
		const installedApps = $.derived(() => appsStore.apps);
		const quicklinks = $.derived(() => quicklinksStore.quicklinks);
		const frecencyData = $.derived(() => frecencyStore.data);
		let searchText = '';
		let quicklinkArgument = '';
		let selectedIndex = 0;
		let listElement = null;
		let searchInputEl = null;
		let argumentInputEl = null;
		let selectedQuicklinkForArgument = null;

		const $$d = $.derived(useCommandPaletteItems({
				searchText: () => searchText,
				plugins: () => plugins,
				installedApps: () => installedApps(),
				quicklinks: () => quicklinks(),
				frecencyData: () => frecencyData(),
				selectedQuicklinkForArgument: () => selectedQuicklinkForArgument
			})),
			displayItems = $.derived(() => $$d().displayItems);

		const selectedItem = $.derived(() => displayItems()[selectedIndex]);

		function resetState() {
			searchText = '';
			quicklinkArgument = '';
			selectedIndex = 0;
			selectedQuicklinkForArgument = null;
		}

		function focusArgumentInput() {
			focusManager.requestFocus('quicklink-argument');
		}

		async function setSearchText(text) {
			searchText = text;
		}

		const actions = useCommandPaletteActions({
			selectedItem: () => selectedItem(),
			onRunPlugin,
			resetState,
			focusArgumentInput
		});

		async function handleArgumentKeydown(e) {
			if (e.key === 'Enter') {
				e.preventDefault();

				if (selectedQuicklinkForArgument) {
					await actions.executeQuicklink(selectedQuicklinkForArgument, quicklinkArgument);
				}
			} else if (e.key === 'Escape' || e.key === 'Backspace' && quicklinkArgument === '') {
				e.preventDefault();
				focusManager.releaseFocus('quicklink-argument');
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function header($$renderer) {
					Header($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div class="relative flex w-full items-center">`);

							HeaderInput($$renderer, {
								placeholder: selectedQuicklinkForArgument
									? selectedQuicklinkForArgument.name
									: 'Search for apps and commands...',
								autofocus: true,
								class: '!pl-0',
								get value() {
									return searchText;
								},

								set value($$value) {
									searchText = $$value;
									$$settled = false;
								},

								get ref() {
									return searchInputEl;
								},

								set ref($$value) {
									searchInputEl = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							if (selectedQuicklinkForArgument) {
								$$renderer.push(`<!--[0--><div class="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center pl-4"><span class="text-lg whitespace-pre text-transparent">${$.escape(searchText || selectedQuicklinkForArgument.name)}</span> <span class="w-2"></span> <div class="pointer-events-auto"><div class="inline-grid items-center"><span class="invisible col-start-1 row-start-1 px-3 text-base whitespace-pre md:text-sm" aria-hidden="true">${$.escape(quicklinkArgument || 'Query')}</span> `);

								Input($$renderer, {
									class: 'border-border col-start-1 row-start-1 h-7 w-full',
									placeholder: 'Query',
									onkeydown: handleArgumentKeydown,
									get value() {
										return quicklinkArgument;
									},

									set value($$value) {
										quicklinkArgument = $$value;
										$$settled = false;
									},

									get ref() {
										return argumentInputEl;
									},

									set ref($$value) {
										argumentInputEl = $$value;
										$$settled = false;
									}
								});

								$$renderer.push(`<!----></div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						},
						$$slots: { default: true }
					});
				}

				function content($$renderer) {
					$$renderer.push(`<div class="grow overflow-y-auto" data-testid="command-palette-content">`);

					{
						function itemSnippet($$renderer, { item, isSelected, onclick }) {
							if (item.type === 'calculator') {
								$$renderer.push('<!--[0-->');

								Calculator($$renderer, {
									searchText: item.data.value,
									mathResult: item.data.result,
									mathResultType: item.data.resultType,
									isSelected,
									onSelect: onclick
								});
							} else if (item.type === 'plugin') {
								$$renderer.push('<!--[1-->');

								const assetsPath = path.dirname(item.data.pluginPath) + '/assets';

								{
									function accessories($$renderer) {
										$$renderer.push(`<span class="text-muted-foreground ml-auto text-xs whitespace-nowrap">Command</span>`);
									}

									ListItemBase($$renderer, {
										title: item.data.title,
										subtitle: item.data.pluginTitle,
										icon: item.data.icon || 'app-window-16',
										assetsPath,
										isSelected,
										onclick,
										accessories,
										$$slots: { accessories: true }
									});
								}
							} else if (item.type === 'app') {
								$$renderer.push('<!--[2-->');

								{
									function accessories($$renderer) {
										$$renderer.push(`<span class="text-muted-foreground ml-auto text-xs whitespace-nowrap">Application</span>`);
									}

									ListItemBase($$renderer, {
										title: item.data.name,
										subtitle: item.data.comment,
										icon: item.data.icon_path ?? 'app-window-16',
										isSelected,
										onclick,
										accessories,
										$$slots: { accessories: true }
									});
								}
							} else if (item.type === 'quicklink') {
								$$renderer.push('<!--[3-->');

								{
									function accessories($$renderer) {
										$$renderer.push(`<span class="text-muted-foreground ml-auto text-xs whitespace-nowrap">Quicklink</span>`);
									}

									ListItemBase($$renderer, {
										title: item.data.name,
										subtitle: item.data.link.replace(/\{argument\}/g, '...'),
										icon: item.data.icon ?? 'link-16',
										isSelected,
										onclick,
										accessories,
										$$slots: { accessories: true }
									});
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						BaseList($$renderer, {
							items: displayItems().map((item) => ({ ...item, itemType: 'item' })),
							onenter: actions.handleEnter,
							get selectedIndex() {
								return selectedIndex;
							},

							set selectedIndex($$value) {
								selectedIndex = $$value;
								$$settled = false;
							},

							get listElement() {
								return listElement;
							},

							set listElement($$value) {
								listElement = $$value;
								$$settled = false;
							},
							itemSnippet,
							$$slots: { itemSnippet: true }
						});
					}

					$$renderer.push(`<!----></div>`);
				}

				function footer($$renderer) {
					CommandPaletteActionBar($$renderer, { selectedItem: selectedItem(), actions, setSearchText });
				}

				MainLayout($$renderer, {
					header,
					content,
					footer,
					$$slots: { header: true, content: true, footer: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}