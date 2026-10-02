import * as $ from 'svelte/internal/server';
import { invoke } from '@tauri-apps/api/core';
import { tick, untrack } from 'svelte';
import { Loader2, Folder, File } from '@lucide/svelte';
import ListItemBase from './nodes/shared/ListItemBase.svelte';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import ActionBar from './nodes/shared/ActionBar.svelte';
import BaseList from './BaseList.svelte';
import { open } from '@tauri-apps/plugin-shell';
import { focusManager } from '$lib/focus.svelte';
import HeaderInput from './HeaderInput.svelte';
import MainLayout from './layout/MainLayout.svelte';
import Header from './layout/Header.svelte';
import InfoList from './InfoList.svelte';
import fileSearchCommandIcon from '$lib/assets/command-file-search-1616x16@2x.png?inline';

export default function FileSearchView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// unix timestamp
		let { onBack } = $$props;

		let searchResults = [];
		let selectedIndex = 0;
		let searchText = '';
		let isFetching = false;
		let searchInputEl = null;
		const selectedItem = $.derived(() => searchResults[selectedIndex]);

		const fetchFiles = async () => {
			if (isFetching) return;

			isFetching = true;

			try {
				const newItems = await invoke('search_files', { term: searchText });

				searchResults = newItems;

				if (selectedIndex >= newItems.length) {
					selectedIndex = 0;
				}
			} catch(e) {
				console.error('Failed to fetch files:', e);
			} finally {
				isFetching = false;
			}
		};

		const formatDateTime = (timestamp) => {
			const date = new Date(timestamp * 1000);

			if (date.getFullYear() < 1971) return 'N/A';

			return date.toLocaleString();
		};

		const handleOpen = async (item) => {
			await open(item.path);
			onBack();
		};

		const handleShow = async (item) => {
			await invoke('show_in_finder', { path: item.path });
		};

		const handleCopyPath = async (item) => {
			await writeText(item.path);
		};

		const handleDelete = async (item) => {
			await invoke('trash', { paths: [item.path] });
			fetchFiles();
		};

		const actions = $.derived(() => selectedItem()
			? [
				{ title: 'Open', handler: () => handleOpen(selectedItem()) },
				{
					title: 'Show in File Manager',
					shortcut: { key: 'Enter', modifiers: ['cmd'] },
					handler: () => handleShow(selectedItem())
				},

				{
					title: 'Copy Path',
					shortcut: { key: 'c', modifiers: ['ctrl'] },
					handler: () => handleCopyPath(selectedItem())
				},

				{
					title: 'Move to Trash',
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
								placeholder: 'Search for files and folders...',
								autofocus: true,
								class: '!pl-2.5',
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
						},
						$$slots: { default: true }
					});
				}

				function content($$renderer) {
					$$renderer.push(`<div class="grid grow grid-cols-[minmax(0,_1.5fr)_minmax(0,_2.5fr)] overflow-y-hidden"><div class="flex-grow overflow-y-auto border-r">`);

					if (isFetching && searchResults.length === 0) {
						$$renderer.push(`<!--[0--><div class="text-muted-foreground flex h-full items-center justify-center">`);
						Loader2($$renderer, { class: 'size-6 animate-spin' });
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					{
						function itemSnippet($$renderer, { item, isSelected, onclick }) {
							$$renderer.push(`<button class="w-full text-left">`);

							ListItemBase($$renderer, {
								icon: item.fileType === 'directory' ? 'folder-16' : 'blank-document-16',
								title: item.name,
								subtitle: item.parentPath,
								isSelected
							});

							$$renderer.push(`<!----></button>`);
						}

						BaseList($$renderer, {
							items: searchResults.map((item) => ({ ...item, id: item.path })),
							onenter: (item) => handleOpen(item),
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

					$$renderer.push(`<!----></div> <div class="flex flex-col overflow-y-hidden">`);

					if (selectedItem()) {
						$$renderer.push(`<!--[0--><div class="flex h-full flex-col items-center justify-center p-4"><div class="mb-4">`);

						if (selectedItem().fileType === 'directory') {
							$$renderer.push('<!--[0-->');
							Folder($$renderer, { class: 'size-24 text-gray-500' });
						} else {
							$$renderer.push('<!--[-1-->');
							File($$renderer, { class: 'size-24 text-gray-500' });
						}

						$$renderer.push(`<!--]--></div> <p class="text-xl font-semibold">${$.escape(selectedItem().name)}</p> <p class="text-muted-foreground text-sm">${$.escape(selectedItem().path)}</p></div> `);

						InfoList($$renderer, {
							title: 'Information',
							items: [
								{
									label: 'Type',
									value: selectedItem().fileType.charAt(0).toUpperCase() + selectedItem().fileType.slice(1)
								},

								{
									label: 'Last Modified',
									value: formatDateTime(selectedItem().lastModified)
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
							icon: fileSearchCommandIcon,
							title: 'Search Files'
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