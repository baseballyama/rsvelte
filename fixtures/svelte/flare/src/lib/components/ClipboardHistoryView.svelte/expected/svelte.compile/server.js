import * as $ from 'svelte/internal/server';
import { invoke } from '@tauri-apps/api/core';
import { onMount, tick, untrack } from 'svelte';
import { VList } from 'virtua/svelte';
import { Loader2 } from '@lucide/svelte';
import ListItemBase from './nodes/shared/ListItemBase.svelte';
import { convertFileSrc } from '@tauri-apps/api/core';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import * as Select from './ui/select';
import ActionBar from './nodes/shared/ActionBar.svelte';
import BaseList from './BaseList.svelte';
import HeaderInput from './HeaderInput.svelte';
import MainLayout from './layout/MainLayout.svelte';
import Header from './layout/Header.svelte';
import InfoList from './InfoList.svelte';
import clipboardHistoryCommandIcon from '$lib/assets/command-clipboard-history-1616x16@2x.png?inline';

export default function ClipboardHistoryView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onBack } = $$props;
		let allItems = [];
		let selectedIndex = 0;
		let searchText = '';
		let filter = 'all';
		let listContainerEl = null;
		let isInitialMount = true;
		let currentPage = 0;
		let hasMore = true;
		let isFetching = false;
		let selectedItemContent = null;
		let virtualizedLines = [];
		let isContentLoading = false;

		const displayedItems = $.derived(() => {
			const items = [];
			const pinned = allItems.filter((item) => item.isPinned);
			const recent = allItems.filter((item) => !item.isPinned);

			if (pinned.length > 0) {
				items.push({ id: 'header-pinned', itemType: 'header', data: 'Pinned' });
				pinned.forEach((item) => items.push({ id: item.id, itemType: 'item', data: item }));
			}

			if (recent.length > 0) {
				items.push({ id: 'header-recent', itemType: 'header', data: 'Most Recent' });
				recent.forEach((item) => items.push({ id: item.id, itemType: 'item', data: item }));
			}

			return items;
		});

		const selectedItem = $.derived(() => displayedItems()[selectedIndex]?.itemType === 'item' ? displayedItems()[selectedIndex].data : null);

		const iconMap = new Map([
			['text', 'text-16'],
			['image', 'image-16'],
			['color', 'swatch-16'],
			['link', 'link-16'],
			['file', 'blank-document-16']
		]);

		const PAGE_SIZE = 50;

		const loadMoreItems = async () => {
			if (isFetching || !hasMore) return;

			isFetching = true;

			try {
				const newItems = await invoke('history_get_items', {
					filter,
					limit: PAGE_SIZE,
					offset: currentPage * PAGE_SIZE,
					searchTerm: searchText || null
				});

				if (newItems.length < PAGE_SIZE) hasMore = false;

				allItems = currentPage === 0 ? newItems : [...allItems, ...newItems];
				currentPage += 1;
			} catch(e) {
				console.error('Failed to fetch clipboard history:', e);
			} finally {
				isFetching = false;
			}
		};

		const resetAndFetch = () => {
			allItems = [];
			currentPage = 0;
			hasMore = true;

			if (isFetching) return;

			selectedIndex = 0;
			tick().then(loadMoreItems);
		};

		const formatDateTime = (dateString) => `Today at ${new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

		const handleCopy = async (item) => {
			const content = item.contentValue ?? await invoke('history_get_item_content', { id: item.id });

			await writeText(content);
			await invoke('history_item_was_copied', { id: item.id });

			const updatedItems = allItems.map((i) => i.id === item.id ? { ...i, timesCopied: i.timesCopied + 1 } : i);

			allItems = updatedItems;
		};

		const handlePin = async (item) => {
			await invoke('history_toggle_pin', { id: item.id });
			resetAndFetch();
		};

		const handleDelete = async (item) => {
			await invoke('history_delete_item', { id: item.id });
			resetAndFetch();
		};

		onMount(() => {
			const container = listContainerEl;

			if (!container) return;

			const onScroll = () => {
				if (container.scrollHeight > container.clientHeight && container.scrollHeight - container.scrollTop - container.clientHeight < 200) {
					loadMoreItems();
				}
			};

			container.addEventListener('scroll', onScroll);
			resetAndFetch();
			isInitialMount = false;

			return () => container.removeEventListener('scroll', onScroll);
		});

		const actions = $.derived(() => selectedItem()
			? [
				{
					title: 'Copy to Clipboard',
					handler: () => handleCopy(selectedItem())
				},

				{
					title: selectedItem().isPinned ? 'Unpin' : 'Pin',
					shortcut: { key: 'P', modifiers: ['cmd', 'shift'] },
					handler: () => handlePin(selectedItem())
				},

				{
					title: 'Delete',
					shortcut: { key: 'x', modifiers: ['ctrl'] },
					handler: () => handleDelete(selectedItem())
				}
			]
			: []);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function header($$renderer) {
					{
						function actions($$renderer) {
							if (Select.Root) {
								$$renderer.push('<!--[-->');

								Select.Root($$renderer, {
									type: 'single',
									get value() {
										return filter;
									},

									set value($$value) {
										filter = $$value;
										$$settled = false;
									},

									children: ($$renderer) => {
										if (Select.Trigger) {
											$$renderer.push('<!--[-->');

											Select.Trigger($$renderer, {
												class: 'w-32',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(filter === 'all'
														? 'All Types'
														: filter.charAt(0).toUpperCase() + filter.slice(1) + 's')}`);
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
													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: 'all',
															children: ($$renderer) => {
																$$renderer.push(`<!---->All Types`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: 'text',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Text`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: 'image',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Images`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: 'link',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Links`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Select.Item) {
														$$renderer.push('<!--[-->');

														Select.Item($$renderer, {
															value: 'color',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Colors`);
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
						}

						Header($$renderer, {
							showBackButton: true,
							onPopView: onBack,
							actions,
							children: ($$renderer) => {
								HeaderInput($$renderer, {
									placeholder: 'Type to filter entries...',
									autofocus: true,
									class: '!pl-2.5',
									get value() {
										return searchText;
									},

									set value($$value) {
										searchText = $$value;
										$$settled = false;
									}
								});
							},
							$$slots: { actions: true, default: true }
						});
					}
				}

				function content($$renderer) {
					$$renderer.push(`<div class="grid grow grid-cols-[minmax(0,_1.5fr)_minmax(0,_2.5fr)] overflow-y-hidden"><div class="flex-grow overflow-y-auto border-r">`);

					{
						function itemSnippet($$renderer, { item, isSelected, onclick: itemOnClick }) {
							if (item.itemType === 'header') {
								$$renderer.push(`<!--[0--><h3 class="text-muted-foreground px-4 pt-2.5 pb-1 text-xs font-semibold uppercase">${$.escape(item.data)}</h3>`);
							} else if (item.itemType === 'item') {
								$$renderer.push('<!--[1-->');

								const clipboardItem = item.data;

								$$renderer.push(`<button class="w-full">`);

								ListItemBase($$renderer, {
									icon: iconMap.get(clipboardItem.contentType) ?? 'question-mark-circle-16',
									title: clipboardItem.preview ?? clipboardItem.contentValue ?? '',
									isSelected
								});

								$$renderer.push(`<!----></button>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						BaseList($$renderer, {
							items: displayedItems(),
							onenter: (item) => handleCopy(item.data),
							isItemSelectable: (item) => item.itemType === 'item',
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

					$$renderer.push(`<!----> `);

					if (isFetching && allItems.length > 0) {
						$$renderer.push(`<!--[0--><div class="text-muted-foreground flex h-10 items-center justify-center">`);
						Loader2($$renderer, { class: 'size-4 animate-spin' });
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="flex flex-col overflow-y-hidden">`);

					if (selectedItem()) {
						$$renderer.push(`<!--[0--><div class="relative flex-grow overflow-y-auto p-4">`);

						if (isContentLoading) {
							$$renderer.push(`<!--[0--><div class="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">`);
							Loader2($$renderer, { class: 'text-muted-foreground size-6 animate-spin' });
							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (selectedItemContent) {
							$$renderer.push('<!--[0-->');

							if (selectedItem().contentType === 'color') {
								$$renderer.push(`<!--[0--><div class="flex flex-col items-center justify-center gap-4 py-8"><div class="size-24 rounded-full border"${$.attr_style('', { 'background-color': selectedItemContent })}></div> <p class="font-mono text-lg">${$.escape(selectedItemContent)}</p></div>`);
							} else if (selectedItem().contentType === 'image') {
								$$renderer.push(`<!--[1--><img${$.attr('src', convertFileSrc(selectedItemContent))} alt="Clipboard content" class="mx-auto max-h-full max-w-full rounded-lg object-contain"/>`);
							} else if (virtualizedLines.length > 0) {
								$$renderer.push(`<!--[2--><div class="h-full font-mono text-sm">`);

								{
									function children($$renderer, item) {
										$$renderer.push(`<div class="whitespace-pre">${$.escape(item)}</div>`);
									}

									VList($$renderer, { data: virtualizedLines, children, $$slots: { default: true } });
								}

								$$renderer.push(`<!----></div>`);
							} else if (selectedItem().contentType === 'text') {
								$$renderer.push(`<!--[3--><div class="rounded bg-black/10 p-4 font-mono text-sm whitespace-pre-wrap">${$.escape(selectedItemContent)}</div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						InfoList($$renderer, {
							title: 'Information',
							items: [
								{
									label: 'Application',
									value: selectedItem().sourceAppName ?? 'Unknown'
								},

								{
									label: 'Content type',
									value: selectedItem().contentType.charAt(0).toUpperCase() + selectedItem().contentType.slice(1)
								},
								{ label: 'Times copied', value: selectedItem().timesCopied },
								{
									label: 'Last copied',
									value: formatDateTime(selectedItem().lastCopiedAt)
								},

								{
									label: 'First copied',
									value: formatDateTime(selectedItem().firstCopiedAt)
								}
							]
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				function footer($$renderer) {
					if (selectedItem()) {
						$$renderer.push('<!--[0-->');

						ActionBar($$renderer, {
							actions: actions(),
							icon: clipboardHistoryCommandIcon,
							title: 'Clipboard History'
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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