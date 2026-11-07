import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="text-muted-foreground flex h-full items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<button class="w-full text-left"><!></button>`);
var root_2 = $.from_html(`<div class="flex h-full flex-col items-center justify-center p-4"><div class="mb-4"><!></div> <p class="text-xl font-semibold"> </p> <p class="text-muted-foreground text-sm"> </p></div> <!>`, 1);
var root_3 = $.from_html(`<div class="grid grow grid-cols-[minmax(0,_1.5fr)_minmax(0,_2.5fr)] overflow-y-hidden"><div class="flex-grow overflow-y-auto border-r"><!> <!></div> <div class="flex flex-col overflow-y-hidden"><!></div></div>`);

export default function FileSearchView($$anchor, $$props) {
	$.push($$props, true);

	// unix timestamp
	let searchResults = $.state($.proxy([]));

	let selectedIndex = $.state(0);
	let searchText = $.state('');
	let isFetching = $.state(false);
	let searchInputEl = $.state(null);
	const selectedItem = $.derived(() => $.get(searchResults)[$.get(selectedIndex)]);

	$.user_effect(() => {
		if (focusManager.activeScope === 'main-input') {
			tick().then(() => {
				$.get(searchInputEl)?.focus();
			});
		}
	});

	const fetchFiles = async () => {
		if ($.get(isFetching)) return;

		$.set(isFetching, true);

		try {
			const newItems = await invoke('search_files', { term: $.get(searchText) });

			$.set(searchResults, newItems, true);

			if ($.get(selectedIndex) >= newItems.length) {
				$.set(selectedIndex, 0);
			}
		} catch(e) {
			console.error('Failed to fetch files:', e);
		} finally {
			$.set(isFetching, false);
		}
	};

	const formatDateTime = (timestamp) => {
		const date = new Date(timestamp * 1000);

		if (date.getFullYear() < 1971) return 'N/A';

		return date.toLocaleString();
	};

	const handleOpen = async (item) => {
		await open(item.path);
		$$props.onBack();
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

	$.user_effect(() => {
		const term = $.get(searchText);

		if (!term) {
			$.set(searchResults, [], true);
			$.set(isFetching, false);

			return;
		}

		untrack(() => {
			const timer = setTimeout(
				() => {
					if (term === $.get(searchText)) {
						fetchFiles();
					}
				},
				200
			);

			return () => clearTimeout(timer);
		});
	});

	const actions = $.derived(() => $.get(selectedItem)
		? [
			{
				title: 'Open',
				handler: () => handleOpen($.get(selectedItem))
			},

			{
				title: 'Show in File Manager',
				shortcut: { key: 'Enter', modifiers: ['cmd'] },
				handler: () => handleShow($.get(selectedItem))
			},

			{
				title: 'Copy Path',
				shortcut: { key: 'c', modifiers: ['ctrl'] },
				handler: () => handleCopyPath($.get(selectedItem))
			},

			{
				title: 'Move to Trash',
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
						placeholder: 'Search for files and folders...',
						autofocus: true,
						class: '!pl-2.5',
						get value() {
							return $.get(searchText);
						},

						set value($$value) {
							$.set(searchText, $$value, true);
						},

						get ref() {
							return $.get(searchInputEl);
						},

						set ref($$value) {
							$.set(searchInputEl, $$value, true);
						}
					});
				},
				$$slots: { default: true }
			});
		};

		const content = ($$anchor) => {
			var div = root_3();
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

				$.if(node, ($$render) => {
					if ($.get(isFetching) && $.get(searchResults).length === 0) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node, 2);

			{
				const itemSnippet = ($$anchor, $$arg0) => {
					let item = () => ($$arg0?.()).item;
					let isSelected = () => ($$arg0?.()).isSelected;
					let onclick = () => ($$arg0?.()).onclick;
					var button = root_1();
					var node_3 = $.child(button);

					{
						let $0 = $.derived(() => item().fileType === 'directory' ? 'folder-16' : 'blank-document-16');

						ListItemBase(node_3, {
							get icon() {
								return $.get($0);
							},

							get title() {
								return item().name;
							},

							get subtitle() {
								return item().parentPath;
							},

							get isSelected() {
								return isSelected();
							}
						});
					}

					$.reset(button);

					$.delegated('click', button, function (...$$args) {
						onclick()?.apply(this, $$args);
					});

					$.append($$anchor, button);
				};

				let $0 = $.derived(() => $.get(searchResults).map((item) => ({ ...item, id: item.path })));

				BaseList(node_2, {
					get items() {
						return $.get($0);
					},
					onenter: (item) => handleOpen(item),
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

			var div_3 = $.sibling(div_1, 2);
			var node_4 = $.child(div_3);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_3 = root_2();
					var div_4 = $.first_child(fragment_3);
					var div_5 = $.child(div_4);
					var node_5 = $.child(div_5);

					{
						var consequent_1 = ($$anchor) => {
							Folder($$anchor, { class: 'size-24 text-gray-500' });
						};

						var alternate = ($$anchor) => {
							File($$anchor, { class: 'size-24 text-gray-500' });
						};

						$.if(node_5, ($$render) => {
							if ($.get(selectedItem).fileType === 'directory') $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.reset(div_5);

					var p = $.sibling(div_5, 2);
					var text = $.only_child(p, true);
					var p_1 = $.sibling(p, 2);
					var text_1 = $.only_child(p_1, true);

					$.reset(div_4);

					var node_6 = $.sibling(div_4, 2);

					{
						let $0 = $.derived(() => [
							{
								label: 'Type',
								value: $.get(selectedItem).fileType.charAt(0).toUpperCase() + $.get(selectedItem).fileType.slice(1)
							},

							{
								label: 'Last Modified',
								value: formatDateTime($.get(selectedItem).lastModified)
							}
						]);

						InfoList(node_6, {
							title: 'Information',
							get items() {
								return $.get($0);
							}
						});
					}

					$.template_effect(() => {
						$.set_text(text, $.get(selectedItem).name);
						$.set_text(text_1, $.get(selectedItem).path);
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_4, ($$render) => {
					if ($.get(selectedItem)) $$render(consequent_2);
				});
			}

			$.reset(div_3);
			$.reset(div);
			$.append($$anchor, div);
		};

		const footer = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_7 = $.first_child(fragment_6);

			{
				var consequent_3 = ($$anchor) => {
					ActionBar($$anchor, {
						get actions() {
							return $.get(actions);
						},

						get icon() {
							return fileSearchCommandIcon;
						},
						title: 'Search Files'
					});
				};

				$.if(node_7, ($$render) => {
					if ($.get(selectedItem)) $$render(consequent_3);
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