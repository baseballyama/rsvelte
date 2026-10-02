import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ExtensionSchema } from '$lib/store';
import { invoke } from '@tauri-apps/api/core';
import ExtensionListView from './extensions/ExtensionListView.svelte';
import ExtensionDetailView from './extensions/ExtensionDetailView.svelte';
import ImageLightbox from './extensions/ImageLightbox.svelte';
import CategoryFilter from './extensions/CategoryFilter.svelte';
import { extensionsStore } from './extensions/store.svelte';
import HeaderInput from './HeaderInput.svelte';
import { viewManager } from '$lib/viewManager.svelte';
import ExtensionInstallConfirm from './extensions/ExtensionInstallConfirm.svelte';
import { fetch } from '@tauri-apps/plugin-http';
import ActionBar from '$lib/components/nodes/shared/ActionBar.svelte';
import { openUrl } from '@tauri-apps/plugin-opener';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import MainLayout from './layout/MainLayout.svelte';
import Header from './layout/Header.svelte';
import storeCommandIcon from '$lib/assets/command-store-1616x16@2x.png?inline';

var root = $.from_html(`<div class="grow overflow-y-auto" role="listbox"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Extensions($$anchor, $$props) {
	$.push($$props, true);

	let selectedExtension = $.state(null);
	let detailedExtension = $.state(null);
	let isDetailLoading = $.state(false);
	let expandedImageUrl = $.state(null);
	let isInstalling = $.state(false);
	let vlistInstance = $.state(null);
	let showConfirmationDialog = $.state(false);
	let confirmationViolations = $.state($.proxy([]));
	let extensionForConfirmation = $.state(null);
	let displayedItems = $.state($.proxy([]));

	$.user_effect(() => {
		const newItems = [];
		const addedIds = new Set();

		const addItems = (exts) => {
			for (const ext of exts) {
				if (!addedIds.has(ext.id)) {
					newItems.push({ id: ext.id, itemType: 'item', data: ext });
					addedIds.add(ext.id);
				}
			}
		};

		if (extensionsStore.searchText) {
			if (extensionsStore.searchResults.length > 0) {
				newItems.push({
					id: 'header-search',
					itemType: 'header',
					data: 'Search Results'
				});

				addItems(extensionsStore.searchResults);
			}
		} else if (extensionsStore.selectedCategory !== 'All Categories') {
			const filtered = extensionsStore.extensions.filter((ext) => ext.categories?.includes(extensionsStore.selectedCategory) ?? false) ?? [];

			if (filtered.length > 0) {
				newItems.push({
					id: `header-${extensionsStore.selectedCategory}`,
					itemType: 'header',
					data: extensionsStore.selectedCategory
				});

				addItems(filtered);
			}
		} else {
			if (extensionsStore.featuredExtensions.length > 0) {
				newItems.push({ id: 'header-featured', itemType: 'header', data: 'Featured' });
				addItems(extensionsStore.featuredExtensions);
			}

			if (extensionsStore.trendingExtensions.length > 0) {
				newItems.push({ id: 'header-trending', itemType: 'header', data: 'Trending' });
				addItems(extensionsStore.trendingExtensions);
			}

			if (extensionsStore.extensions.length > 0) {
				newItems.push({ id: 'header-all', itemType: 'header', data: 'All Extensions' });
				addItems(extensionsStore.extensions);
			}
		}

		if (!extensionsStore.isSearching) {
			$.set(displayedItems, newItems, true);
		}
	});

	const selectedListItem = $.derived(() => $.get(displayedItems)[extensionsStore.selectedIndex]);
	const selectedListExtension = $.derived(() => $.get(selectedListItem)?.itemType === 'item' ? $.get(selectedListItem).data : null);

	$.user_effect(() => {
		const ext = viewManager.extensionToSelect;

		if (ext) {
			$.set(selectedExtension, ext, true);
			viewManager.extensionToSelect = null;
		}
	});

	$.user_effect(() => {
		if ($.get(selectedExtension) && $.get(selectedExtension).id !== $.get(detailedExtension)?.id) {
			$.set(detailedExtension, null);
			$.set(isDetailLoading, true);

			const fetchDetails = async () => {
				try {
					const res = await fetch(`https://backend.raycast.com/api/v1/extensions/${$.get(selectedExtension).author.handle}/${$.get(selectedExtension).name}`);

					if (!res.ok) throw new Error(`Failed to fetch extension details: ${res.status}`);

					const json = await res.json();
					const parsed = ExtensionSchema.parse(json);

					$.set(detailedExtension, parsed, true);
				} catch(e) {
					console.error('Failed to fetch or parse extension details, using list data.', e);
					$.set(detailedExtension, $.get(selectedExtension), true);
				} finally {
					$.set(isDetailLoading, false);
				}
			};

			fetchDetails();
		} else if (!$.get(selectedExtension)) {
			$.set(detailedExtension, null);
		}
	});

	const handleScroll = () => {
		if (!$.get(vlistInstance)) return;

		if ($.get(vlistInstance).getScrollSize() - $.get(vlistInstance).getScrollOffset() - $.get(vlistInstance).getViewportSize() < 500) {
			extensionsStore.loadMore();
		}
	};

	function handleOpenInBrowser() {
		if (!$.get(selectedListExtension)) return;

		const { author, name: slug } = $.get(selectedListExtension);

		openUrl(`https://raycast.com/${author.handle}/${slug}`);
	}

	function handleCopyExtensionUrl() {
		if (!$.get(selectedListExtension)) return;

		const { author, name: slug } = $.get(selectedListExtension);

		writeText(`https://raycast.com/${author.handle}/${slug}`);
	}

	function handleViewReadme() {
		if (!$.get(selectedListExtension) || !$.get(selectedListExtension).readme_url) return;

		openUrl($.get(selectedListExtension).readme_url);
	}

	function handleViewSourceCode() {
		if (!$.get(selectedListExtension) || !$.get(selectedListExtension).source_url) return;

		openUrl($.get(selectedListExtension).source_url);
	}

	async function installExtension(extensionToInstall) {
		if ($.get(isInstalling)) return;

		$.set(isInstalling, true);

		try {
			const result = await invoke('install_extension', {
				downloadUrl: extensionToInstall.download_url,
				slug: extensionToInstall.name,
				force: false
			});

			if (result.status === 'success') {
				$$props.onInstall();
			} else if (result.status === 'requiresConfirmation' && result.violations) {
				$.set(extensionForConfirmation, extensionToInstall, true);
				$.set(confirmationViolations, result.violations, true);
				$.set(showConfirmationDialog, true);
			}
		} catch(e) {
			console.error('Installation failed', e);
		} finally {
			$.set(isInstalling, false);
		}
	}

	async function handleInstall() {
		const extensionToInstall = $.get(detailedExtension) || $.get(selectedExtension);

		if (extensionToInstall) {
			await installExtension(extensionToInstall);
		}
	}

	async function handleForceInstall() {
		$.set(showConfirmationDialog, false);

		const extensionToInstall = $.get(extensionForConfirmation);

		if (!extensionToInstall) return;

		$.set(isInstalling, true);

		try {
			await invoke('install_extension', {
				downloadUrl: extensionToInstall.download_url,
				slug: extensionToInstall.name,
				force: true
			});

			$$props.onInstall();
		} catch(e) {
			console.error('Forced installation failed', e);
		} finally {
			$.set(isInstalling, false);
		}
	}

	const actions = $.derived(() => $.get(selectedListExtension)
		? [
			{
				title: 'Show Details',
				handler: () => $.set(selectedExtension, $.get(selectedListExtension), true)
			},

			{
				title: $.get(isInstalling) ? 'Installing...' : 'Install Extension',
				handler: () => installExtension($.get(selectedListExtension)),
				disabled: $.get(isInstalling)
			},

			{
				title: 'Open in Browser',
				shortcut: { key: 'o', modifiers: ['opt', 'ctrl'] },
				handler: handleOpenInBrowser
			},

			{
				title: 'Copy Extension URL',
				shortcut: { key: '.', modifiers: ['ctrl'] },
				handler: handleCopyExtensionUrl
			},

			{
				title: 'View README',
				shortcut: { key: 'r', modifiers: ['opt', 'shift', 'ctrl'] },
				handler: handleViewReadme,
				disabled: !$.get(selectedListExtension).readme_url
			},

			{
				title: 'View Source Code',
				shortcut: { key: 'o', modifiers: ['shift', 'ctrl'] },
				handler: handleViewSourceCode,
				disabled: !$.get(selectedListExtension).source_url
			}
		]
		: []);

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const header = ($$anchor) => {
			{
				const actions = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							CategoryFilter($$anchor, {});
						};

						$.if(node_1, ($$render) => {
							if (!$.get(selectedExtension)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				};

				let $0 = $.derived(() => extensionsStore.isLoading && !$.get(selectedExtension) || $.get(isDetailLoading));

				Header($$anchor, {
					showBackButton: true,
					onPopView: () => $.get(selectedExtension) ? $.set(selectedExtension, null) : $$props.onBack(),
					get isLoading() {
						return $.get($0);
					},
					actions,
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_2 = $.first_child(fragment_4);

						{
							var consequent_1 = ($$anchor) => {
								HeaderInput($$anchor, {
									placeholder: 'Search Store for extensions...',
									autofocus: true,
									class: '!pl-2.5',
									get value() {
										return extensionsStore.searchText;
									},

									set value($$value) {
										extensionsStore.searchText = $$value;
									}
								});
							};

							$.if(node_2, ($$render) => {
								if (!$.get(selectedExtension)) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_4);
					},
					$$slots: { actions: true, default: true }
				});
			}
		};

		const content = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_3 = $.first_child(fragment_6);

			{
				var consequent_2 = ($$anchor) => {
					const extensionToShow = $.derived(() => $.get(detailedExtension) || $.get(selectedExtension));

					ExtensionDetailView($$anchor, {
						get extension() {
							return $.get(extensionToShow);
						},

						get isInstalling() {
							return $.get(isInstalling);
						},
						onInstall: handleInstall,
						onOpenLightbox: (imageUrl) => $.set(expandedImageUrl, imageUrl, true)
					});
				};

				var alternate = ($$anchor) => {
					var div = root();

					$.set_attribute(div, 'tabindex', -1);

					var node_4 = $.child(div);

					ExtensionListView(node_4, {
						get items() {
							return $.get(displayedItems);
						},
						onSelect: (ext) => $.set(selectedExtension, ext, true),
						onScroll: handleScroll,
						get vlistInstance() {
							return $.get(vlistInstance);
						},

						set vlistInstance($$value) {
							$.set(vlistInstance, $$value, true);
						}
					});

					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node_3, ($$render) => {
					if ($.get(selectedExtension)) $$render(consequent_2); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_6);
		};

		const footer = ($$anchor) => {
			var fragment_8 = $.comment();
			var node_5 = $.first_child(fragment_8);

			{
				var consequent_3 = ($$anchor) => {
					ActionBar($$anchor, {
						title: 'Store',
						get icon() {
							return storeCommandIcon;
						},

						get actions() {
							return $.get(actions);
						}
					});
				};

				$.if(node_5, ($$render) => {
					if (!$.get(selectedExtension) && $.get(selectedListExtension)) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_8);
		};

		MainLayout(node, {
			header,
			content,
			footer,
			$$slots: { header: true, content: true, footer: true }
		});
	}

	var node_6 = $.sibling(node, 2);

	{
		var consequent_4 = ($$anchor) => {
			ImageLightbox($$anchor, {
				get imageUrl() {
					return $.get(expandedImageUrl);
				},
				onClose: () => $.set(expandedImageUrl, null)
			});
		};

		$.if(node_6, ($$render) => {
			if ($.get(expandedImageUrl)) $$render(consequent_4);
		});
	}

	var node_7 = $.sibling(node_6, 2);

	ExtensionInstallConfirm(node_7, {
		get violations() {
			return $.get(confirmationViolations);
		},
		onconfirm: handleForceInstall,
		oncancel: () => $.set(showConfirmationDialog, false),
		get open() {
			return $.get(showConfirmationDialog);
		},

		set open($$value) {
			$.set(showConfirmationDialog, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}