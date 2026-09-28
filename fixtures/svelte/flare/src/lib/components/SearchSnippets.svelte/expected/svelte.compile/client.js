import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invoke } from '@tauri-apps/api/core';
import { onMount, untrack } from 'svelte';
import { Loader2 } from '@lucide/svelte';
import ListItemBase from './nodes/shared/ListItemBase.svelte';
import ActionBar from './nodes/shared/ActionBar.svelte';
import BaseList from './BaseList.svelte';
import HeaderInput from './HeaderInput.svelte';
import MainLayout from './layout/MainLayout.svelte';
import Header from './layout/Header.svelte';
import InfoList from './InfoList.svelte';
import snippetIcon from '$lib/assets/snippets-package-1616x16@2x.png?inline';

var root = $.from_html(`<div class="text-muted-foreground flex h-full items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<h3 class="text-muted-foreground px-4 pt-2.5 pb-1 text-xs font-semibold uppercase"> </h3>`);
var root_2 = $.from_html(`<button class="w-full text-left"><!></button>`);
var root_3 = $.from_html(`<div class="relative flex-grow overflow-y-auto p-4"><div class="font-mono text-sm whitespace-pre-wrap"> </div></div> <!>`, 1);
var root_4 = $.from_html(`<div class="grid grow grid-cols-[minmax(0,_1.5fr)_minmax(0,_2.5fr)] overflow-y-hidden"><div class="flex-grow overflow-y-auto border-r"><!></div> <div class="flex flex-col overflow-y-hidden"><!></div></div>`);

export default function SearchSnippets($$anchor, $$props) {
	$.push($$props, true);

	let snippets = $.state($.proxy([]));
	let selectedIndex = $.state(0);
	let searchText = $.state('');
	let isFetching = $.state(false);

	const displayedItems = $.derived(() => {
		const items = [];
		let lastHeader = '';
		const today = new Date();

		today.setHours(0, 0, 0, 0);

		const yesterday = new Date(today);

		yesterday.setDate(yesterday.getDate() - 1);

		for (const snippet of $.get(snippets)) {
			const snippetDate = new Date(snippet.updatedAt);
			let header = '';
			const snippetDay = new Date(snippetDate);

			snippetDay.setHours(0, 0, 0, 0);

			if (snippetDay.getTime() === today.getTime()) {
				header = 'Today';
			} else if (snippetDay.getTime() === yesterday.getTime()) {
				header = 'Yesterday';
			} else {
				header = snippetDay.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
			}

			if (header !== lastHeader) {
				items.push({ id: `header-${header}`, itemType: 'header', data: header });
				lastHeader = header;
			}

			items.push({ id: snippet.id, itemType: 'item', data: snippet });
		}

		return items;
	});

	const selectedItem = $.derived(() => $.get(displayedItems)[$.get(selectedIndex)]?.itemType === 'item'
		? $.get(displayedItems)[$.get(selectedIndex)].data
		: null);

	const fetchSnippets = async () => {
		if ($.get(isFetching)) return;

		$.set(isFetching, true);

		try {
			const newItems = await invoke('list_snippets', { searchTerm: $.get(searchText) || null });

			$.set(snippets, newItems, true);

			if ($.get(selectedIndex) >= newItems.length) {
				$.set(selectedIndex, 0);
			}
		} catch(e) {
			console.error('Failed to fetch snippets:', e);
		} finally {
			$.set(isFetching, false);
		}
	};

	const formatDateTime = (dateString) => {
		const date = new Date(dateString);

		if (date.getFullYear() < 1971) return 'Never';

		return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
	};

	const handlePaste = async (item) => {
		await invoke('paste_snippet_content', { content: item.content });
		await invoke('snippet_was_used', { id: item.id });

		const updatedItems = $.get(snippets).map((i) => i.id === item.id
			? {
				...i,
				timesUsed: i.timesUsed + 1,
				lastUsedAt: new Date().toISOString()
			}
			: i);

		$.set(snippets, updatedItems, true);
		$$props.onBack();
	};

	const handleDelete = async (item) => {
		await invoke('delete_snippet', { id: item.id });
		fetchSnippets();
	};

	onMount(() => {
		fetchSnippets();
	});

	$.user_effect(() => {
		const term = $.get(searchText);

		untrack(() => {
			const timer = setTimeout(
				() => {
					if (term === $.get(searchText)) {
						fetchSnippets();
					}
				},
				300
			);

			return () => clearTimeout(timer);
		});
	});

	const actions = $.derived(() => $.get(selectedItem)
		? [
			{
				title: 'Paste',
				handler: () => handlePaste($.get(selectedItem))
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
			Header($$anchor, {
				showBackButton: true,
				get onPopView() {
					return $$props.onBack;
				},

				children: ($$anchor, $$slotProps) => {
					HeaderInput($$anchor, {
						placeholder: 'Search snippets...',
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
				$$slots: { default: true }
			});
		};

		const content = ($$anchor) => {
			var div = root_4();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					var div_2 = root();
					var node_1 = $.child(div_2);

					Loader2(node_1, { class: 'size-6 animate-spin' });
					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				var alternate = ($$anchor) => {
					{
						const itemSnippet = ($$anchor, $$arg0) => {
							let item = () => ($$arg0?.()).item;
							let isSelected = () => ($$arg0?.()).isSelected;
							let itemOnClick = () => ($$arg0?.()).onclick;
							var fragment_4 = $.comment();
							var node_2 = $.first_child(fragment_4);

							{
								var consequent_1 = ($$anchor) => {
									var h3 = root_1();
									var text = $.only_child(h3, true);

									$.template_effect(() => $.set_text(text, item().data));
									$.append($$anchor, h3);
								};

								var consequent_2 = ($$anchor) => {
									const snippetItem = $.derived(() => item().data);
									var button = root_2();
									var node_3 = $.child(button);

									ListItemBase(node_3, {
										icon: 'snippets-16',
										get title() {
											return $.get(snippetItem).name;
										},

										get subtitle() {
											return $.get(snippetItem).keyword;
										},

										get isSelected() {
											return isSelected();
										}
									});

									$.reset(button);

									$.delegated('click', button, function (...$$args) {
										itemOnClick()?.apply(this, $$args);
									});

									$.append($$anchor, button);
								};

								$.if(node_2, ($$render) => {
									if (item().itemType === 'header') $$render(consequent_1); else if (item().itemType === 'item') $$render(consequent_2, 1);
								});
							}

							$.append($$anchor, fragment_4);
						};

						BaseList($$anchor, {
							get items() {
								return $.get(displayedItems);
							},
							onenter: (item) => handlePaste(item.data),
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
				};

				$.if(node, ($$render) => {
					if ($.get(isFetching) && $.get(snippets).length === 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div_1);

			var div_3 = $.sibling(div_1, 2);
			var node_4 = $.child(div_3);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_5 = root_3();
					var div_4 = $.first_child(fragment_5);
					var div_5 = $.child(div_4);
					var text_1 = $.only_child(div_5, true);

					$.reset(div_4);

					var node_5 = $.sibling(div_4, 2);

					{
						let $0 = $.derived(() => [
							{ label: 'Name', value: $.get(selectedItem).name },
							{ label: 'Content type', value: 'Text' },
							{ label: 'Times used', value: $.get(selectedItem).timesUsed },
							{
								label: 'Last used',
								value: formatDateTime($.get(selectedItem).lastUsedAt)
							}
						]);

						InfoList(node_5, {
							title: 'Information',
							get items() {
								return $.get($0);
							}
						});
					}

					$.template_effect(() => $.set_text(text_1, $.get(selectedItem).content));
					$.append($$anchor, fragment_5);
				};

				$.if(node_4, ($$render) => {
					if ($.get(selectedItem)) $$render(consequent_3);
				});
			}

			$.reset(div_3);
			$.reset(div);
			$.append($$anchor, div);
		};

		const footer = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_6 = $.first_child(fragment_6);

			{
				var consequent_4 = ($$anchor) => {
					ActionBar($$anchor, {
						get actions() {
							return $.get(actions);
						},

						get icon() {
							return snippetIcon;
						},
						title: 'Search Snippets'
					});
				};

				$.if(node_6, ($$render) => {
					if ($.get(selectedItem)) $$render(consequent_4);
				});
			}

			$.append($$anchor, fragment_6);
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