import * as $ from 'svelte/internal/server';

import {
	IconFilter,
	IconInfoCircle,
	IconLanguage,
	IconLayoutGrid,
	IconNews,
	IconPalette,
	IconUserCircle
} from '@tabler/icons-svelte';

import { useOverlayScrollbars } from 'overlayscrollbars-svelte';
import { getContext } from 'svelte';
import Portal from 'svelte-portal';
import { s } from '$lib/client/localization.svelte';
import { syncSettingsWatcher } from '$lib/client/sync-settings-watcher.svelte';
import { cancelAllSettings, saveAllSettings, settingsModalState } from '$lib/data/settings.svelte.js';
import { ttsManager } from '$lib/stores/ttsManager.svelte';
import { createModalBehavior } from '$lib/utils/modalBehavior.svelte';
import { scrollLock } from '$lib/utils/scrollLock.js';
import SettingsAbout from './settings/SettingsAbout.svelte';
import SettingsAccount from './settings/SettingsAccount.svelte';
import SettingsAppearance from './settings/SettingsAppearance.svelte';
import SettingsCategories from './settings/SettingsCategories.svelte';
import SettingsFilters from './settings/SettingsFilters.svelte';
import SettingsImagePreloading from './settings/SettingsImagePreloading.svelte';
import SettingsLanguage from './settings/SettingsLanguage.svelte';
import SettingsStories from './settings/SettingsStories.svelte';
import 'overlayscrollbars/overlayscrollbars.css';
import { fade } from 'svelte/transition';

export default function Settings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Feature flag: Enable macOS-style sidebar layout on desktop (disabled by default)
		const USE_SIDEBAR_LAYOUT = false;

		// Props
		let { visible = false, categories = [], onClose, onShowAbout } = $$props;

		// Get session from context to check subscription
		const session = getContext('session');

		// Active tab state - use from settings modal state if provided
		let activeTab = settingsModalState.activeTab || 'appearance';

		// Update activeTab when settingsModalState.activeTab changes
		// Debug mode - show preloading tab
		let showPreloadingTab = false;

		// Load debug tab setting from localStorage
		// Expose debug method to enable preloading tab
		if (typeof window !== 'undefined') {
			window.kiteSettingsDebug = {
				enablePreloadingTab: () => {
					showPreloadingTab = true;

					// Save to localStorage for persistence
					if (typeof localStorage !== 'undefined') {
						localStorage.setItem('kite-debug-preloading-tab', 'true');
					}

					return true;
				},

				disablePreloadingTab: () => {
					showPreloadingTab = false;

					// Remove from localStorage
					if (typeof localStorage !== 'undefined') {
						localStorage.removeItem('kite-debug-preloading-tab');
					}

					return false;
				}
			};
		}

		// Modal behavior
		const modal = createModalBehavior();

		// OverlayScrollbars setup
		let scrollableElement = undefined;

		let [initialize, instance] = useOverlayScrollbars({
			defer: true,
			options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } }
		});

		// Focus management
		let dialogElement = undefined;

		let closeButtonMobile = undefined;
		let closeButtonDesktop = undefined;
		let previousActiveElement = null;

		// Close settings
		function handleClose() {
			settingsModalState.isOpen = false;

			if (onClose) onClose();
		}

		// Handle keyboard events for the modal
		function handleModalKeydown(e) {
			if (e.key === 'Escape') {
				handleClose();

				return;
			}

			// Focus trap on Tab
			if (e.key === 'Tab' && dialogElement) {
				const focusableSelectors = [
					'button:not([disabled]):not([tabindex="-1"])',
					'[href]:not([disabled])',
					'input:not([disabled])',
					'select:not([disabled])',
					'textarea:not([disabled])',
					'[tabindex="0"]:not([disabled])'
				];

				const focusableElements = Array.from(dialogElement.querySelectorAll(focusableSelectors.join(', ')));

				if (focusableElements.length === 0) return;

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];
				const activeElement = document.activeElement;

				// If focus is outside modal, bring it in
				if (!dialogElement.contains(activeElement)) {
					e.preventDefault();
					firstElement.focus();

					return;
				}

				if (e.shiftKey && activeElement === firstElement) {
					e.preventDefault();
					lastElement.focus();
				} else if (!e.shiftKey && activeElement === lastElement) {
					e.preventDefault();
					firstElement.focus();
				}
			}
		}

		// Handle visibility changes
		// Stop all TTS playback when settings opens
		// Store the previously active element
		// Lock background scroll
		// Focus the close button after modal renders (whichever is visible)
		// Desktop close button is visible on md+ screens
		// Cleanup only runs when visible changes from true to false, or on destroy
		// Return focus to the previously active element
		// Initialize OverlayScrollbars
		// Tab change handler
		function changeTab(tabName) {
			activeTab = tabName;

			// Reset scroll position when changing tabs
			if (scrollableElement) {
				scrollableElement.scrollTop = 0;

				// Also reset OverlayScrollbars if initialized
				const osInstance = instance();

				if (osInstance) {
					osInstance.elements().viewport.scrollTop = 0;
				}
			}
		}

		// Scroll active tab into view (for mobile horizontal tabs)
		function scrollTabIntoView(tabId) {
			if (!tabsContainer) return;

			const tabElement = tabsContainer.querySelector(`#tab-${tabId}`);

			if (tabElement) {
				tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
			}
		}

		// Handle keyboard navigation for tabs
		function handleTabKeydown(e) {
			const currentIndex = tabs().findIndex((t) => t.id === activeTab);
			let newIndex = currentIndex;

			switch (e.key) {
				case 'ArrowRight':

				case 'ArrowDown':
					e.preventDefault();
					newIndex = (currentIndex + 1) % tabs().length;
					break;

				case 'ArrowLeft':

				case 'ArrowUp':
					e.preventDefault();
					newIndex = (currentIndex - 1 + tabs().length) % tabs().length;
					break;

				case 'Home':
					e.preventDefault();
					newIndex = 0;
					break;

				case 'End':
					e.preventDefault();
					newIndex = tabs().length - 1;
					break;

				default:
					return;
			}

			if (newIndex !== currentIndex) {
				const newTab = tabs()[newIndex];

				changeTab(newTab.id);

				// Focus and scroll the new tab into view
				setTimeout(
					() => {
						const tabElement = tabsContainer?.querySelector(`#tab-${newTab.id}`);

						if (tabElement) {
							tabElement.focus();
							scrollTabIntoView(newTab.id);
						}
					},
					0
				);
			}
		}

		// Tab scroll state for showing gradient indicators (mobile)
		let tabsContainer = undefined;

		let canScrollLeft = false;
		let canScrollRight = false;

		function updateScrollIndicators() {
			if (!tabsContainer) return;

			canScrollLeft = tabsContainer.scrollLeft > 0;
			canScrollRight = tabsContainer.scrollLeft < tabsContainer.scrollWidth - tabsContainer.clientWidth - 1;
		}

		function scrollTabs(direction) {
			if (!tabsContainer) return;

			const scrollAmount = 150;

			tabsContainer.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth'
			});
		}

		// Also check on resize
		// Tab configuration with icons
		const tabs = $.derived(() => [
			{
				id: 'appearance',
				labelKey: 'settings.tabs.appearance',
				fallback: 'Appearance',
				icon: IconPalette
			},

			{
				id: 'language',
				labelKey: 'settings.tabs.language',
				fallback: 'Language',
				icon: IconLanguage
			},

			{
				id: 'categories',
				labelKey: 'settings.tabs.categories',
				fallback: 'Categories',
				icon: IconLayoutGrid
			},

			{
				id: 'stories',
				labelKey: 'settings.tabs.stories',
				fallback: 'Stories',
				icon: IconNews
			},

			{
				id: 'filters',
				labelKey: 'settings.tabs.filters',
				fallback: 'Filters',
				icon: IconFilter
			},

			{
				id: 'account',
				labelKey: 'settings.tabs.account',
				fallback: 'Account',
				icon: IconUserCircle
			},

			{
				id: 'about',
				labelKey: 'settings.tabs.about',
				fallback: 'About',
				icon: IconInfoCircle
			},

			...showPreloadingTab
				? [
					{
						id: 'preloading',
						labelKey: '',
						fallback: 'Preloading (Debug)',
						icon: IconInfoCircle
					}
				]
				: []
		]);

		if (visible) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="fixed inset-0 z-modal flex items-center justify-center bg-black/60 dark:bg-black/80" role="dialog" aria-modal="true" aria-labelledby="settings-title" tabindex="-1"><div${$.attr_class('flex h-full w-full flex-col bg-white shadow-xl md:h-[85vh] md:max-w-240 md:rounded-xl dark:bg-gray-800', void 0, { 'md:flex-row': USE_SIDEBAR_LAYOUT })} role="document"><header${$.attr_class('shrink-0 bg-white p-4 md:rounded-t-xl dark:bg-gray-800', void 0, { 'md:hidden': USE_SIDEBAR_LAYOUT })}><div class="mb-3 flex w-full items-center justify-between"><h2 id="settings-title" class="font-lufga text-2xl font-medium text-gray-900 dark:text-gray-100">${$.escape(s("header.settings") || "Settings")}</h2> <button class="cursor-pointer rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"${$.attr('aria-label', s("ui.close") || "Close")}><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg></button></div> <div class="relative"><div class="scrollbar-hide overflow-x-auto border-b border-gray-200 dark:border-gray-700" role="tablist" aria-labelledby="settings-title"><div class="flex min-w-max"><!--[-->`);

					const each_array = $.ensure_array_like(tabs());

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let tab = each_array[$$index];

						$$renderer.push(`<button${$.attr_class('flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible-ring whitespace-nowrap', void 0, {
							'border-blue-500': activeTab === tab.id,
							'text-blue-600': activeTab === tab.id,
							'dark:text-blue-400': activeTab === tab.id,
							'border-transparent': activeTab !== tab.id,
							'text-gray-500': activeTab !== tab.id,
							'dark:text-gray-400': activeTab !== tab.id
						})}${$.attr('aria-selected', activeTab === tab.id)} aria-controls="settings-content" role="tab"${$.attr('id', `tab-${$.stringify(tab.id)}`)}${$.attr('tabindex', activeTab === tab.id ? 0 : -1)}>`);

						if (USE_SIDEBAR_LAYOUT) {
							$$renderer.push('<!--[0-->');

							const Icon = tab.icon;

							if (Icon) {
								$$renderer.push('<!--[-->');
								Icon($$renderer, { size: 18 });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> ${$.escape(s(tab.labelKey) || tab.fallback)}</button>`);
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (canScrollLeft) {
						$$renderer.push(`<!--[0--><button class="absolute left-0 top-0 bottom-0 flex items-center pl-1 pr-4 bg-linear-to-r from-white via-white to-transparent dark:from-gray-800 dark:via-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus-visible-ring rounded-r" aria-label="Scroll tabs left"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (canScrollRight) {
						$$renderer.push(`<!--[0--><button class="absolute right-0 top-0 bottom-0 flex items-center pr-1 pl-4 bg-linear-to-l from-white via-white to-transparent dark:from-gray-800 dark:via-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus-visible-ring rounded-l" aria-label="Scroll tabs right"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></header> `);

					if (USE_SIDEBAR_LAYOUT) {
						$$renderer.push(`<!--[0--><aside class="hidden md:flex md:w-48 md:shrink-0 md:flex-col bg-gray-50 dark:bg-gray-900/50 rounded-l-xl border-r border-gray-200 dark:border-gray-700"><h2 id="settings-title-desktop" class="sr-only">${$.escape(s("header.settings") || "Settings")}</h2> <div class="flex-1 p-3 space-y-1" role="tablist" aria-labelledby="settings-title-desktop" tabindex="-1"><!--[-->`);

						const each_array_1 = $.ensure_array_like(tabs());

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let tab = each_array_1[$$index_1];
							const Icon = tab.icon;

							$$renderer.push(`<button${$.attr_class(`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors focus-visible-ring ${activeTab === tab.id
								? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
								: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`)}${$.attr('aria-selected', activeTab === tab.id)} aria-controls="settings-content" role="tab"${$.attr('id', `tab-desktop-${$.stringify(tab.id)}`)}${$.attr('tabindex', activeTab === tab.id ? 0 : -1)}>`);

							if (Icon) {
								$$renderer.push('<!--[-->');
								Icon($$renderer, { size: 20, class: 'shrink-0' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <span>${$.escape(s(tab.labelKey) || tab.fallback)}</span></button>`);
						}

						$$renderer.push(`<!--]--></div></aside>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div${$.attr_class('flex flex-1 flex-col overflow-hidden', void 0, {
						'md:rounded-r-xl': USE_SIDEBAR_LAYOUT,
						'md:rounded-xl': !USE_SIDEBAR_LAYOUT
					})}><div${$.attr_class('hidden justify-end p-4 pb-0', void 0, { 'md:flex': USE_SIDEBAR_LAYOUT })}><button class="text-gray-500 transition-colors duration-200 hover:text-gray-700 focus-visible-ring rounded dark:text-gray-400 dark:hover:text-gray-200"${$.attr('aria-label', s("ui.close") || "Close")}><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <main class="flex-1 overflow-auto p-4 md:p-6 md:pt-2" id="settings-content"${$.attr('aria-labelledby', `tab-${$.stringify(activeTab)}`)} data-overlayscrollbars-initialize="">`);

					if (activeTab === "appearance") {
						$$renderer.push('<!--[0-->');
						SettingsAppearance($$renderer, {});
					} else if (activeTab === "language") {
						$$renderer.push('<!--[1-->');
						SettingsLanguage($$renderer, {});
					} else if (activeTab === "categories") {
						$$renderer.push('<!--[2-->');
						SettingsCategories($$renderer, { categories });
					} else if (activeTab === "stories") {
						$$renderer.push('<!--[3-->');
						SettingsStories($$renderer, {});
					} else if (activeTab === "filters") {
						$$renderer.push('<!--[4-->');
						SettingsFilters($$renderer, {});
					} else if (activeTab === "account") {
						$$renderer.push('<!--[5-->');
						SettingsAccount($$renderer, {});
					} else if (activeTab === "about") {
						$$renderer.push('<!--[6-->');
						SettingsAbout($$renderer, { onShowAbout });
					} else if (activeTab === "preloading") {
						$$renderer.push('<!--[7-->');
						SettingsImagePreloading($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></main></div></div></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}