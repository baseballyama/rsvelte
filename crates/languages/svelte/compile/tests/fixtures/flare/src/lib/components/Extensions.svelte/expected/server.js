import * as $ from 'svelte/internal/server';
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

export default function Extensions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onBack, onInstall } = $$props;
		let selectedExtension = null;
		let detailedExtension = null;
		let isDetailLoading = false;
		let expandedImageUrl = null;
		let isInstalling = false;
		let vlistInstance = null;
		let showConfirmationDialog = false;
		let confirmationViolations = [];
		let extensionForConfirmation = null;
		let displayedItems = [];
		const selectedListItem = $.derived(() => displayedItems[extensionsStore.selectedIndex]);
		const selectedListExtension = $.derived(() => selectedListItem()?.itemType === 'item' ? selectedListItem().data : null);

		const handleScroll = () => {
			if (!vlistInstance) return;

			if (vlistInstance.getScrollSize() - vlistInstance.getScrollOffset() - vlistInstance.getViewportSize() < 500) {
				extensionsStore.loadMore();
			}
		};

		function handleOpenInBrowser() {
			if (!selectedListExtension()) return;

			const { author, name: slug } = selectedListExtension();

			openUrl(`https://raycast.com/${author.handle}/${slug}`);
		}

		function handleCopyExtensionUrl() {
			if (!selectedListExtension()) return;

			const { author, name: slug } = selectedListExtension();

			writeText(`https://raycast.com/${author.handle}/${slug}`);
		}

		function handleViewReadme() {
			if (!selectedListExtension() || !selectedListExtension().readme_url) return;

			openUrl(selectedListExtension().readme_url);
		}

		function handleViewSourceCode() {
			if (!selectedListExtension() || !selectedListExtension().source_url) return;

			openUrl(selectedListExtension().source_url);
		}

		async function installExtension(extensionToInstall) {
			if (isInstalling) return;

			isInstalling = true;

			try {
				const result = await invoke('install_extension', {
					downloadUrl: extensionToInstall.download_url,
					slug: extensionToInstall.name,
					force: false
				});

				if (result.status === 'success') {
					onInstall();
				} else if (result.status === 'requiresConfirmation' && result.violations) {
					extensionForConfirmation = extensionToInstall;
					confirmationViolations = result.violations;
					showConfirmationDialog = true;
				}
			} catch(e) {
				console.error('Installation failed', e);
			} finally {
				isInstalling = false;
			}
		}

		async function handleInstall() {
			const extensionToInstall = detailedExtension || selectedExtension;

			if (extensionToInstall) {
				await installExtension(extensionToInstall);
			}
		}

		async function handleForceInstall() {
			showConfirmationDialog = false;

			const extensionToInstall = extensionForConfirmation;

			if (!extensionToInstall) return;

			isInstalling = true;

			try {
				await invoke('install_extension', {
					downloadUrl: extensionToInstall.download_url,
					slug: extensionToInstall.name,
					force: true
				});

				onInstall();
			} catch(e) {
				console.error('Forced installation failed', e);
			} finally {
				isInstalling = false;
			}
		}

		const actions = $.derived(() => selectedListExtension()
			? [
				{
					title: 'Show Details',
					handler: () => selectedExtension = selectedListExtension()
				},

				{
					title: isInstalling ? 'Installing...' : 'Install Extension',
					handler: () => installExtension(selectedListExtension()),
					disabled: isInstalling
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
					disabled: !selectedListExtension().readme_url
				},

				{
					title: 'View Source Code',
					shortcut: { key: 'o', modifiers: ['shift', 'ctrl'] },
					handler: handleViewSourceCode,
					disabled: !selectedListExtension().source_url
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
							if (!selectedExtension) {
								$$renderer.push('<!--[0-->');
								CategoryFilter($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						Header($$renderer, {
							showBackButton: true,
							onPopView: () => selectedExtension ? selectedExtension = null : onBack(),
							isLoading: extensionsStore.isLoading && !selectedExtension || isDetailLoading,
							actions,
							children: ($$renderer) => {
								if (!selectedExtension) {
									$$renderer.push('<!--[0-->');

									HeaderInput($$renderer, {
										placeholder: 'Search Store for extensions...',
										autofocus: true,
										class: '!pl-2.5',
										get value() {
											return extensionsStore.searchText;
										},

										set value($$value) {
											extensionsStore.searchText = $$value;
											$$settled = false;
										}
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { actions: true, default: true }
						});
					}
				}

				function content($$renderer) {
					if (selectedExtension) {
						$$renderer.push('<!--[0-->');

						const extensionToShow = detailedExtension || selectedExtension;

						ExtensionDetailView($$renderer, {
							extension: extensionToShow,
							isInstalling,
							onInstall: handleInstall,
							onOpenLightbox: (imageUrl) => expandedImageUrl = imageUrl
						});
					} else {
						$$renderer.push(`<!--[-1--><div class="grow overflow-y-auto" role="listbox"${$.attr('tabindex', -1)}>`);

						ExtensionListView($$renderer, {
							items: displayedItems,
							onSelect: (ext) => selectedExtension = ext,
							onScroll: handleScroll,
							get vlistInstance() {
								return vlistInstance;
							},

							set vlistInstance($$value) {
								vlistInstance = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				function footer($$renderer) {
					if (!selectedExtension && selectedListExtension()) {
						$$renderer.push('<!--[0-->');
						ActionBar($$renderer, { title: 'Store', icon: storeCommandIcon, actions: actions() });
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

			$$renderer.push(`<!----> `);

			if (expandedImageUrl) {
				$$renderer.push('<!--[0-->');

				ImageLightbox($$renderer, {
					imageUrl: expandedImageUrl,
					onClose: () => expandedImageUrl = null
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			ExtensionInstallConfirm($$renderer, {
				violations: confirmationViolations,
				onconfirm: handleForceInstall,
				oncancel: () => showConfirmationDialog = false,
				get open() {
					return showConfirmationDialog;
				},

				set open($$value) {
					showConfirmationDialog = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}