import * as $ from 'svelte/internal/server';
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

export default function SearchSnippets($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onBack } = $$props;
		let snippets = [];
		let selectedIndex = 0;
		let searchText = '';
		let isFetching = false;

		const displayedItems = $.derived(() => {
			const items = [];
			let lastHeader = '';
			const today = new Date();

			today.setHours(0, 0, 0, 0);

			const yesterday = new Date(today);

			yesterday.setDate(yesterday.getDate() - 1);

			for (const snippet of snippets) {
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

		const selectedItem = $.derived(() => displayedItems()[selectedIndex]?.itemType === 'item' ? displayedItems()[selectedIndex].data : null);

		const fetchSnippets = async () => {
			if (isFetching) return;

			isFetching = true;

			try {
				const newItems = await invoke('list_snippets', { searchTerm: searchText || null });

				snippets = newItems;

				if (selectedIndex >= newItems.length) {
					selectedIndex = 0;
				}
			} catch(e) {
				console.error('Failed to fetch snippets:', e);
			} finally {
				isFetching = false;
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

			const updatedItems = snippets.map((i) => i.id === item.id
				? {
					...i,
					timesUsed: i.timesUsed + 1,
					lastUsedAt: new Date().toISOString()
				}
				: i);

			snippets = updatedItems;
			onBack();
		};

		const handleDelete = async (item) => {
			await invoke('delete_snippet', { id: item.id });
			fetchSnippets();
		};

		onMount(() => {
			fetchSnippets();
		});

		const actions = $.derived(() => selectedItem()
			? [
				{ title: 'Paste', handler: () => handlePaste(selectedItem()) },
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
					Header($$renderer, {
						showBackButton: true,
						onPopView: onBack,
						children: ($$renderer) => {
							HeaderInput($$renderer, {
								placeholder: 'Search snippets...',
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
						$$slots: { default: true }
					});
				}

				function content($$renderer) {
					$$renderer.push(`<div class="grid grow grid-cols-[minmax(0,_1.5fr)_minmax(0,_2.5fr)] overflow-y-hidden"><div class="flex-grow overflow-y-auto border-r">`);

					if (isFetching && snippets.length === 0) {
						$$renderer.push(`<!--[0--><div class="text-muted-foreground flex h-full items-center justify-center">`);
						Loader2($$renderer, { class: 'size-6 animate-spin' });
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');

						{
							function itemSnippet($$renderer, { item, isSelected, onclick: itemOnClick }) {
								if (item.itemType === 'header') {
									$$renderer.push(`<!--[0--><h3 class="text-muted-foreground px-4 pt-2.5 pb-1 text-xs font-semibold uppercase">${$.escape(item.data)}</h3>`);
								} else if (item.itemType === 'item') {
									$$renderer.push('<!--[1-->');

									const snippetItem = item.data;

									$$renderer.push(`<button class="w-full text-left">`);

									ListItemBase($$renderer, {
										icon: 'snippets-16',
										title: snippetItem.name,
										subtitle: snippetItem.keyword,
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
								onenter: (item) => handlePaste(item.data),
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
					}

					$$renderer.push(`<!--]--></div> <div class="flex flex-col overflow-y-hidden">`);

					if (selectedItem()) {
						$$renderer.push(`<!--[0--><div class="relative flex-grow overflow-y-auto p-4"><div class="font-mono text-sm whitespace-pre-wrap">${$.escape(selectedItem().content)}</div></div> `);

						InfoList($$renderer, {
							title: 'Information',
							items: [
								{ label: 'Name', value: selectedItem().name },
								{ label: 'Content type', value: 'Text' },
								{ label: 'Times used', value: selectedItem().timesUsed },
								{
									label: 'Last used',
									value: formatDateTime(selectedItem().lastUsedAt)
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
							icon: snippetIcon,
							title: 'Search Snippets'
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