import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<h3 class="text-muted-foreground px-4 pt-2.5 pb-1 text-xs font-semibold uppercase"> </h3>`);
var root_3 = $.from_html(`<button class="w-full"><!></button>`);
var root_4 = $.from_html(`<div class="text-muted-foreground flex h-10 items-center justify-center"><!></div>`);
var root_5 = $.from_html(`<div class="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm"><!></div>`);
var root_6 = $.from_html(`<div class="flex flex-col items-center justify-center gap-4 py-8"><div class="size-24 rounded-full border"></div> <p class="font-mono text-lg"> </p></div>`);
var root_7 = $.from_html(`<img alt="Clipboard content" class="mx-auto max-h-full max-w-full rounded-lg object-contain"/>`);
var root_8 = $.from_html(`<div class="whitespace-pre"> </div>`);
var root_9 = $.from_html(`<div class="h-full font-mono text-sm"><!></div>`);
var root_10 = $.from_html(`<div class="rounded bg-black/10 p-4 font-mono text-sm whitespace-pre-wrap"> </div>`);
var root_11 = $.from_html(`<div class="relative flex-grow overflow-y-auto p-4"><!> <!></div> <!>`, 1);
var root_12 = $.from_html(`<div class="grid grow grid-cols-[minmax(0,_1.5fr)_minmax(0,_2.5fr)] overflow-y-hidden"><div class="flex-grow overflow-y-auto border-r"><!> <!></div> <div class="flex flex-col overflow-y-hidden"><!></div></div>`);

export default function ClipboardHistoryView($$anchor, $$props) {
	$.push($$props, true);

	let allItems = $.state($.proxy([]));
	let selectedIndex = $.state(0);
	let searchText = $.state('');
	let filter = $.state('all');
	let listContainerEl = $.state(null);
	let isInitialMount = $.state(true);
	let currentPage = $.state(0);
	let hasMore = $.state(true);
	let isFetching = $.state(false);
	let selectedItemContent = $.state(null);
	let virtualizedLines = $.state($.proxy([]));
	let isContentLoading = $.state(false);

	const displayedItems = $.derived(() => {
		const items = [];
		const pinned = $.get(allItems).filter((item) => item.isPinned);
		const recent = $.get(allItems).filter((item) => !item.isPinned);

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

	const selectedItem = $.derived(() => $.get(displayedItems)[$.get(selectedIndex)]?.itemType === 'item'
		? $.get(displayedItems)[$.get(selectedIndex)].data
		: null);

	const iconMap = new Map([
		['text', 'text-16'],
		['image', 'image-16'],
		['color', 'swatch-16'],
		['link', 'link-16'],
		['file', 'blank-document-16']
	]);

	const PAGE_SIZE = 50;

	const loadMoreItems = async () => {
		if ($.get(isFetching) || !$.get(hasMore)) return;

		$.set(isFetching, true);

		try {
			const newItems = await invoke('history_get_items', {
				filter: $.get(filter),
				limit: PAGE_SIZE,
				offset: $.get(currentPage) * PAGE_SIZE,
				searchTerm: $.get(searchText) || null
			});

			if (newItems.length < PAGE_SIZE) $.set(hasMore, false);

			$.set(allItems, $.get(currentPage) === 0 ? newItems : [...$.get(allItems), ...newItems], true);
			$.set(currentPage, $.get(currentPage) + 1);
		} catch(e) {
			console.error('Failed to fetch clipboard history:', e);
		} finally {
			$.set(isFetching, false);
		}
	};

	const resetAndFetch = () => {
		$.set(allItems, [], true);
		$.set(currentPage, 0);
		$.set(hasMore, true);

		if ($.get(isFetching)) return;

		$.set(selectedIndex, 0);
		tick().then(loadMoreItems);
	};

	const formatDateTime = (dateString) => `Today at ${new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

	const handleCopy = async (item) => {
		const content = item.contentValue ?? await invoke('history_get_item_content', { id: item.id });

		await writeText(content);
		await invoke('history_item_was_copied', { id: item.id });

		const updatedItems = $.get(allItems).map((i) => i.id === item.id ? { ...i, timesCopied: i.timesCopied + 1 } : i);

		$.set(allItems, updatedItems, true);
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
		const container = $.get(listContainerEl);

		if (!container) return;

		const onScroll = () => {
			if (container.scrollHeight > container.clientHeight && container.scrollHeight - container.scrollTop - container.clientHeight < 200) {
				loadMoreItems();
			}
		};

		container.addEventListener('scroll', onScroll);
		resetAndFetch();
		$.set(isInitialMount, false);

		return () => container.removeEventListener('scroll', onScroll);
	});

	$.user_effect(() => {
		[$.get(searchText), $.get(filter)];

		if ($.get(isInitialMount)) return;

		untrack(() => {
			resetAndFetch();
		});
	});

	$.user_effect(() => {
		const item = $.get(selectedItem);

		$.set(virtualizedLines, [], true);
		$.set(selectedItemContent, null);

		if (!item) return;

		const processContent = async () => {
			if (item.contentValue !== null) {
				$.set(selectedItemContent, item.contentValue, true);
				$.set(isContentLoading, false);

				return;
			}

			$.set(isContentLoading, true);

			try {
				const fullContent = await invoke('history_get_item_content', { id: item.id });

				if ($.get(selectedItem)?.id !== item.id) return;

				if (item.contentType === 'text' && item.contentSizeBytes > 10000) {
					$.set(selectedItemContent, fullContent, true);
					await tick();
					$.set(virtualizedLines, fullContent.split('\n'), true);
				} else {
					$.set(selectedItemContent, fullContent, true);
				}
			} catch(err) {
				console.error('Failed to load content', err);

				if ($.get(selectedItem)?.id === item.id) $.set(selectedItemContent, 'Error: Could not load content.');
			} finally {
				if ($.get(selectedItem)?.id === item.id) $.set(isContentLoading, false);
			}
		};

		processContent();
	});

	const actions = $.derived(() => $.get(selectedItem)
		? [
			{
				title: 'Copy to Clipboard',
				handler: () => handleCopy($.get(selectedItem))
			},

			{
				title: $.get(selectedItem).isPinned ? 'Unpin' : 'Pin',
				shortcut: { key: 'P', modifiers: ['cmd', 'shift'] },
				handler: () => handlePin($.get(selectedItem))
			},

			{
				title: 'Delete',
				shortcut: { key: 'x', modifiers: ['ctrl'] },
				handler: () => handleDelete($.get(selectedItem))
			}
		]
		: []);

	{
		const header = ($$anchor) => {
			{
				const actions = ($$anchor) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
						Select_Root($$anchor, {
							type: 'single',
							get value() {
								return $.get(filter);
							},

							set value($$value) {
								$.set(filter, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_1 = $.first_child(fragment_3);

								$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
									Select_Trigger($$anchor, {
										class: 'w-32',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(($0) => $.set_text(text, $0), [
												() => $.get(filter) === 'all'
													? 'All Types'
													: $.get(filter).charAt(0).toUpperCase() + $.get(filter).slice(1) + 's'
											]);

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								var node_2 = $.sibling(node_1, 2);

								$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
									Select_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_3 = $.first_child(fragment_5);

											$.component(node_3, () => Select.Item, ($$anchor, Select_Item) => {
												Select_Item($$anchor, {
													value: 'all',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('All Types');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => Select.Item, ($$anchor, Select_Item_1) => {
												Select_Item_1($$anchor, {
													value: 'text',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Text');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_5 = $.sibling(node_4, 2);

											$.component(node_5, () => Select.Item, ($$anchor, Select_Item_2) => {
												Select_Item_2($$anchor, {
													value: 'image',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Images');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => Select.Item, ($$anchor, Select_Item_3) => {
												Select_Item_3($$anchor, {
													value: 'link',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Links');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_6, 2);

											$.component(node_7, () => Select.Item, ($$anchor, Select_Item_4) => {
												Select_Item_4($$anchor, {
													value: 'color',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Colors');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
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
				};

				Header($$anchor, {
					showBackButton: true,
					get onPopView() {
						return $$props.onBack;
					},
					actions,
					children: ($$anchor, $$slotProps) => {
						HeaderInput($$anchor, {
							placeholder: 'Type to filter entries...',
							autofocus: true,
							class: '!pl-2.5',
							get value() {
								return $.get(searchText);
							},

							set value($$value) {
								$.set(searchText, $$value, true);
							}
						});
					},
					$$slots: { actions: true, default: true }
				});
			}
		};

		const content = ($$anchor) => {
			var div = root_12();
			var div_1 = $.child(div);
			var node_8 = $.child(div_1);

			{
				const itemSnippet = ($$anchor, $$arg0) => {
					let item = () => ($$arg0?.()).item;
					let isSelected = () => ($$arg0?.()).isSelected;
					let itemOnClick = () => ($$arg0?.()).onclick;
					var fragment_7 = $.comment();
					var node_9 = $.first_child(fragment_7);

					{
						var consequent = ($$anchor) => {
							var h3 = root_2();
							var text_6 = $.only_child(h3, true);

							$.template_effect(() => $.set_text(text_6, item().data));
							$.append($$anchor, h3);
						};

						var consequent_1 = ($$anchor) => {
							const clipboardItem = $.derived(() => item().data);
							var button = root_3();
							var node_10 = $.child(button);

							{
								let $0 = $.derived(() => iconMap.get($.get(clipboardItem).contentType) ?? 'question-mark-circle-16');
								let $1 = $.derived(() => $.get(clipboardItem).preview ?? $.get(clipboardItem).contentValue ?? '');

								ListItemBase(node_10, {
									get icon() {
										return $.get($0);
									},

									get title() {
										return $.get($1);
									},

									get isSelected() {
										return isSelected();
									}
								});
							}

							$.reset(button);

							$.delegated('click', button, function (...$$args) {
								itemOnClick()?.apply(this, $$args);
							});

							$.append($$anchor, button);
						};

						$.if(node_9, ($$render) => {
							if (item().itemType === 'header') $$render(consequent); else if (item().itemType === 'item') $$render(consequent_1, 1);
						});
					}

					$.append($$anchor, fragment_7);
				};

				BaseList(node_8, {
					get items() {
						return $.get(displayedItems);
					},
					onenter: (item) => handleCopy(item.data),
					isItemSelectable: (item) => item.itemType === 'item',
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

			var node_11 = $.sibling(node_8, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_2 = root_4();
					var node_12 = $.child(div_2);

					Loader2(node_12, { class: 'size-4 animate-spin' });
					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_11, ($$render) => {
					if ($.get(isFetching) && $.get(allItems).length > 0) $$render(consequent_2);
				});
			}

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(listContainerEl, $$value), () => $.get(listContainerEl));

			var div_3 = $.sibling(div_1, 2);
			var node_13 = $.child(div_3);

			{
				var consequent_9 = ($$anchor) => {
					var fragment_8 = root_11();
					var div_4 = $.first_child(fragment_8);
					var node_14 = $.child(div_4);

					{
						var consequent_3 = ($$anchor) => {
							var div_5 = root_5();
							var node_15 = $.child(div_5);

							Loader2(node_15, { class: 'text-muted-foreground size-6 animate-spin' });
							$.reset(div_5);
							$.append($$anchor, div_5);
						};

						$.if(node_14, ($$render) => {
							if ($.get(isContentLoading)) $$render(consequent_3);
						});
					}

					var node_16 = $.sibling(node_14, 2);

					{
						var consequent_8 = ($$anchor) => {
							var fragment_9 = $.comment();
							var node_17 = $.first_child(fragment_9);

							{
								var consequent_4 = ($$anchor) => {
									var div_6 = root_6();
									var div_7 = $.child(div_6);
									let styles;
									var p = $.sibling(div_7, 2);
									var text_7 = $.only_child(p, true);

									$.reset(div_6);

									$.template_effect(() => {
										styles = $.set_style(div_7, '', styles, { 'background-color': $.get(selectedItemContent) });
										$.set_text(text_7, $.get(selectedItemContent));
									});

									$.append($$anchor, div_6);
								};

								var consequent_5 = ($$anchor) => {
									var img = root_7();

									$.template_effect(($0) => $.set_attribute(img, 'src', $0), [() => convertFileSrc($.get(selectedItemContent))]);
									$.append($$anchor, img);
								};

								var consequent_6 = ($$anchor) => {
									var div_8 = root_9();
									var node_18 = $.child(div_8);

									{
										const children = ($$anchor, item = $.noop) => {
											var div_9 = root_8();
											var text_8 = $.only_child(div_9, true);

											$.template_effect(() => $.set_text(text_8, item()));
											$.append($$anchor, div_9);
										};

										VList(node_18, {
											get data() {
												return $.get(virtualizedLines);
											},
											children,
											$$slots: { default: true }
										});
									}

									$.reset(div_8);
									$.append($$anchor, div_8);
								};

								var consequent_7 = ($$anchor) => {
									var div_10 = root_10();
									var text_9 = $.only_child(div_10, true);

									$.template_effect(() => $.set_text(text_9, $.get(selectedItemContent)));
									$.append($$anchor, div_10);
								};

								$.if(node_17, ($$render) => {
									if ($.get(selectedItem).contentType === 'color') $$render(consequent_4); else if ($.get(selectedItem).contentType === 'image') $$render(consequent_5, 1); else if ($.get(virtualizedLines).length > 0) $$render(consequent_6, 2); else if ($.get(selectedItem).contentType === 'text') $$render(consequent_7, 3);
								});
							}

							$.append($$anchor, fragment_9);
						};

						$.if(node_16, ($$render) => {
							if ($.get(selectedItemContent)) $$render(consequent_8);
						});
					}

					$.reset(div_4);

					var node_19 = $.sibling(div_4, 2);

					{
						let $0 = $.derived(() => [
							{
								label: 'Application',
								value: $.get(selectedItem).sourceAppName ?? 'Unknown'
							},

							{
								label: 'Content type',
								value: $.get(selectedItem).contentType.charAt(0).toUpperCase() + $.get(selectedItem).contentType.slice(1)
							},

							{
								label: 'Times copied',
								value: $.get(selectedItem).timesCopied
							},

							{
								label: 'Last copied',
								value: formatDateTime($.get(selectedItem).lastCopiedAt)
							},

							{
								label: 'First copied',
								value: formatDateTime($.get(selectedItem).firstCopiedAt)
							}
						]);

						InfoList(node_19, {
							title: 'Information',
							get items() {
								return $.get($0);
							}
						});
					}

					$.append($$anchor, fragment_8);
				};

				$.if(node_13, ($$render) => {
					if ($.get(selectedItem)) $$render(consequent_9);
				});
			}

			$.reset(div_3);
			$.reset(div);
			$.append($$anchor, div);
		};

		const footer = ($$anchor) => {
			var fragment_10 = $.comment();
			var node_20 = $.first_child(fragment_10);

			{
				var consequent_10 = ($$anchor) => {
					ActionBar($$anchor, {
						get actions() {
							return $.get(actions);
						},

						get icon() {
							return clipboardHistoryCommandIcon;
						},
						title: 'Clipboard History'
					});
				};

				$.if(node_20, ($$render) => {
					if ($.get(selectedItem)) $$render(consequent_10);
				});
			}

			$.append($$anchor, fragment_10);
		};

		MainLayout($$anchor, {
			header,
			content,
			footer,
			$$slots: { header: true, content: true, footer: true }
		});
	}

	$.pop();
}

$.delegate(['click']);