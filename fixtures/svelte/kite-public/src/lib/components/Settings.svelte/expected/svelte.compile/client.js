import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<button aria-controls="settings-content" role="tab"><!> </button>`);
var root_1 = $.from_html(`<button class="absolute left-0 top-0 bottom-0 flex items-center pl-1 pr-4 bg-linear-to-r from-white via-white to-transparent dark:from-gray-800 dark:via-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus-visible-ring rounded-r" aria-label="Scroll tabs left"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>`);
var root_2 = $.from_html(`<button class="absolute right-0 top-0 bottom-0 flex items-center pr-1 pl-4 bg-linear-to-l from-white via-white to-transparent dark:from-gray-800 dark:via-gray-800 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus-visible-ring rounded-l" aria-label="Scroll tabs right"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>`);
var root_3 = $.from_html(`<button aria-controls="settings-content" role="tab"><!> <span> </span></button>`);
var root_4 = $.from_html(`<aside class="hidden md:flex md:w-48 md:shrink-0 md:flex-col bg-gray-50 dark:bg-gray-900/50 rounded-l-xl border-r border-gray-200 dark:border-gray-700"><h2 id="settings-title-desktop" class="sr-only"> </h2> <div class="flex-1 p-3 space-y-1" role="tablist" aria-labelledby="settings-title-desktop" tabindex="-1"></div></aside>`);
var root_5 = $.from_html(`<div class="fixed inset-0 z-modal flex items-center justify-center bg-black/60 dark:bg-black/80" role="dialog" aria-modal="true" aria-labelledby="settings-title" tabindex="-1"><div role="document"><header><div class="mb-3 flex w-full items-center justify-between"><h2 id="settings-title" class="font-lufga text-2xl font-medium text-gray-900 dark:text-gray-100"> </h2> <button class="cursor-pointer rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg></button></div> <div class="relative"><div class="scrollbar-hide overflow-x-auto border-b border-gray-200 dark:border-gray-700" role="tablist" aria-labelledby="settings-title"><div class="flex min-w-max"></div></div> <!> <!></div></header> <!> <div><div><button class="text-gray-500 transition-colors duration-200 hover:text-gray-700 focus-visible-ring rounded dark:text-gray-400 dark:hover:text-gray-200"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <main class="flex-1 overflow-auto p-4 md:p-6 md:pt-2" id="settings-content" data-overlayscrollbars-initialize=""><!></main></div></div></div>`);

export default function Settings($$anchor, $$props) {
	$.push($$props, true);

	// Feature flag: Enable macOS-style sidebar layout on desktop (disabled by default)
	const USE_SIDEBAR_LAYOUT = false;

	// Props
	let visible = $.prop($$props, 'visible', 3, false),
		categories = $.prop($$props, 'categories', 19, () => []);

	// Get session from context to check subscription
	const session = getContext('session');

	// Active tab state - use from settings modal state if provided
	let activeTab = $.state($.proxy(settingsModalState.activeTab || 'appearance'));

	// Update activeTab when settingsModalState.activeTab changes
	$.user_effect(() => {
		if (settingsModalState.activeTab) {
			$.set(activeTab, settingsModalState.activeTab, true);
		}
	});

	// Debug mode - show preloading tab
	let showPreloadingTab = $.state(false);

	// Load debug tab setting from localStorage
	$.user_effect(() => {
		if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
			const savedDebugTab = localStorage.getItem('kite-debug-preloading-tab');

			if (savedDebugTab === 'true') {
				$.set(showPreloadingTab, true);
			}
		}
	});

	// Expose debug method to enable preloading tab
	if (typeof window !== 'undefined') {
		window.kiteSettingsDebug = {
			enablePreloadingTab: () => {
				$.set(showPreloadingTab, true);

				// Save to localStorage for persistence
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('kite-debug-preloading-tab', 'true');
				}

				return true;
			},

			disablePreloadingTab: () => {
				$.set(showPreloadingTab, false);

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
	let scrollableElement = $.state(undefined);

	let [initialize, instance] = useOverlayScrollbars({
		defer: true,
		options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } }
	});

	// Focus management
	let dialogElement = $.state(undefined);

	let closeButtonMobile = $.state(undefined);
	let closeButtonDesktop = $.state(undefined);
	let previousActiveElement = null;

	// Close settings
	function handleClose() {
		settingsModalState.isOpen = false;

		if ($$props.onClose) $$props.onClose();
	}

	// Handle keyboard events for the modal
	function handleModalKeydown(e) {
		if (e.key === 'Escape') {
			handleClose();

			return;
		}

		// Focus trap on Tab
		if (e.key === 'Tab' && $.get(dialogElement)) {
			const focusableSelectors = [
				'button:not([disabled]):not([tabindex="-1"])',
				'[href]:not([disabled])',
				'input:not([disabled])',
				'select:not([disabled])',
				'textarea:not([disabled])',
				'[tabindex="0"]:not([disabled])'
			];

			const focusableElements = Array.from($.get(dialogElement).querySelectorAll(focusableSelectors.join(', ')));

			if (focusableElements.length === 0) return;

			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];
			const activeElement = document.activeElement;

			// If focus is outside modal, bring it in
			if (!$.get(dialogElement).contains(activeElement)) {
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
	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		if (visible()) {
			// Stop all TTS playback when settings opens
			ttsManager.stopAll();

			// Store the previously active element
			previousActiveElement = document.activeElement;

			// Lock background scroll
			scrollLock.lock();

			// Focus the close button after modal renders (whichever is visible)
			requestAnimationFrame(() => {
				// Desktop close button is visible on md+ screens
				const isDesktop = window.matchMedia('(min-width: 768px)').matches;

				const buttonToFocus = isDesktop ? $.get(closeButtonDesktop) : $.get(closeButtonMobile);

				if (buttonToFocus) {
					buttonToFocus.focus();
				}
			});

			// Cleanup only runs when visible changes from true to false, or on destroy
			return () => {
				scrollLock.unlock();

				// Return focus to the previously active element
				if (previousActiveElement && 'focus' in previousActiveElement) {
					previousActiveElement.focus();
				}
			};
		}
	});

	// Initialize OverlayScrollbars
	$.user_effect(() => {
		if ($.get(scrollableElement)) {
			initialize($.get(scrollableElement));
		}
	});

	// Tab change handler
	function changeTab(tabName) {
		$.set(activeTab, tabName, true);

		// Reset scroll position when changing tabs
		if ($.get(scrollableElement)) {
			$.get(scrollableElement).scrollTop = 0;

			// Also reset OverlayScrollbars if initialized
			const osInstance = instance();

			if (osInstance) {
				osInstance.elements().viewport.scrollTop = 0;
			}
		}
	}

	// Scroll active tab into view (for mobile horizontal tabs)
	function scrollTabIntoView(tabId) {
		if (!$.get(tabsContainer)) return;

		const tabElement = $.get(tabsContainer).querySelector(`#tab-${tabId}`);

		if (tabElement) {
			tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
		}
	}

	// Handle keyboard navigation for tabs
	function handleTabKeydown(e) {
		const currentIndex = $.get(tabs).findIndex((t) => t.id === $.get(activeTab));
		let newIndex = currentIndex;

		switch (e.key) {
			case 'ArrowRight':

			case 'ArrowDown':
				e.preventDefault();
				newIndex = (currentIndex + 1) % $.get(tabs).length;
				break;

			case 'ArrowLeft':

			case 'ArrowUp':
				e.preventDefault();
				newIndex = (currentIndex - 1 + $.get(tabs).length) % $.get(tabs).length;
				break;

			case 'Home':
				e.preventDefault();
				newIndex = 0;
				break;

			case 'End':
				e.preventDefault();
				newIndex = $.get(tabs).length - 1;
				break;

			default:
				return;
		}

		if (newIndex !== currentIndex) {
			const newTab = $.get(tabs)[newIndex];

			changeTab(newTab.id);

			// Focus and scroll the new tab into view
			setTimeout(
				() => {
					const tabElement = $.get(tabsContainer)?.querySelector(`#tab-${newTab.id}`);

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
	let tabsContainer = $.state(undefined);

	let canScrollLeft = $.state(false);
	let canScrollRight = $.state(false);

	function updateScrollIndicators() {
		if (!$.get(tabsContainer)) return;

		$.set(canScrollLeft, $.get(tabsContainer).scrollLeft > 0);
		$.set(canScrollRight, $.get(tabsContainer).scrollLeft < $.get(tabsContainer).scrollWidth - $.get(tabsContainer).clientWidth - 1);
	}

	function scrollTabs(direction) {
		if (!$.get(tabsContainer)) return;

		const scrollAmount = 150;

		$.get(tabsContainer).scrollBy({
			left: direction === 'left' ? -scrollAmount : scrollAmount,
			behavior: 'smooth'
		});
	}

	$.user_effect(() => {
		if ($.get(tabsContainer) && visible()) {
			updateScrollIndicators();
			$.get(tabsContainer).addEventListener('scroll', updateScrollIndicators);

			// Also check on resize
			const resizeObserver = new ResizeObserver(updateScrollIndicators);

			resizeObserver.observe($.get(tabsContainer));

			return () => {
				$.get(tabsContainer)?.removeEventListener('scroll', updateScrollIndicators);
				resizeObserver.disconnect();
			};
		}
	});

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

		...$.get(showPreloadingTab)
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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_12 = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root_5();
					var div_1 = $.child(div);

					$.set_class(div_1, 1, 'flex h-full w-full flex-col bg-white shadow-xl md:h-[85vh] md:max-w-240 md:rounded-xl dark:bg-gray-800', null, {}, { 'md:flex-row': USE_SIDEBAR_LAYOUT });

					var header = $.child(div_1);

					$.set_class(header, 1, 'shrink-0 bg-white p-4 md:rounded-t-xl dark:bg-gray-800', null, {}, { 'md:hidden': USE_SIDEBAR_LAYOUT });

					var div_2 = $.child(header);
					var h2 = $.child(div_2);
					var text = $.only_child(h2, true);
					var button = $.sibling(h2, 2);

					$.bind_this(button, ($$value) => $.set(closeButtonMobile, $$value), () => $.get(closeButtonMobile));
					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var div_4 = $.child(div_3);
					var div_5 = $.child(div_4);

					$.each(div_5, 21, () => $.get(tabs), $.index, ($$anchor, tab) => {
						var button_1 = root();
						let classes;
						var node_1 = $.child(button_1);

						{
							var consequent = ($$anchor) => {
								const Icon = $.derived(() => $.get(tab).icon);
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => $.get(Icon), ($$anchor, Icon_1) => {
									Icon_1($$anchor, { size: 18 });
								});

								$.append($$anchor, fragment_2);
							};

							$.if(node_1, ($$render) => {
								if (USE_SIDEBAR_LAYOUT) $$render(consequent);
							});
						}

						var text_1 = $.sibling(node_1);

						$.reset(button_1);

						$.template_effect(
							($0) => {
								classes = $.set_class(button_1, 1, 'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible-ring whitespace-nowrap', null, classes, {
									'border-blue-500': $.get(activeTab) === $.get(tab).id,
									'text-blue-600': $.get(activeTab) === $.get(tab).id,
									'dark:text-blue-400': $.get(activeTab) === $.get(tab).id,
									'border-transparent': $.get(activeTab) !== $.get(tab).id,
									'text-gray-500': $.get(activeTab) !== $.get(tab).id,
									'dark:text-gray-400': $.get(activeTab) !== $.get(tab).id
								});

								$.set_attribute(button_1, 'aria-selected', $.get(activeTab) === $.get(tab).id);
								$.set_attribute(button_1, 'id', `tab-${$.get(tab).id ?? ''}`);
								$.set_attribute(button_1, 'tabindex', $.get(activeTab) === $.get(tab).id ? 0 : -1);
								$.set_text(text_1, ` ${$0 ?? ''}`);
							},
							[() => s($.get(tab).labelKey) || $.get(tab).fallback]
						);

						$.delegated('click', button_1, () => changeTab($.get(tab).id));
						$.append($$anchor, button_1);
					});

					$.reset(div_5);
					$.reset(div_4);
					$.bind_this(div_4, ($$value) => $.set(tabsContainer, $$value), () => $.get(tabsContainer));

					var node_3 = $.sibling(div_4, 2);

					{
						var consequent_1 = ($$anchor) => {
							var button_2 = root_1();

							$.delegated('click', button_2, () => scrollTabs('left'));
							$.append($$anchor, button_2);
						};

						$.if(node_3, ($$render) => {
							if ($.get(canScrollLeft)) $$render(consequent_1);
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent_2 = ($$anchor) => {
							var button_3 = root_2();

							$.delegated('click', button_3, () => scrollTabs('right'));
							$.append($$anchor, button_3);
						};

						$.if(node_4, ($$render) => {
							if ($.get(canScrollRight)) $$render(consequent_2);
						});
					}

					$.reset(div_3);
					$.reset(header);

					var node_5 = $.sibling(header, 2);

					{
						var consequent_3 = ($$anchor) => {
							var aside = root_4();
							var h2_1 = $.child(aside);
							var text_2 = $.only_child(h2_1, true);
							var div_6 = $.sibling(h2_1, 2);

							$.each(div_6, 21, () => $.get(tabs), $.index, ($$anchor, tab) => {
								const Icon = $.derived(() => $.get(tab).icon);
								var button_4 = root_3();
								var node_6 = $.child(button_4);

								$.component(node_6, () => $.get(Icon), ($$anchor, Icon_2) => {
									Icon_2($$anchor, { size: 20, class: 'shrink-0' });
								});

								var span = $.sibling(node_6, 2);
								var text_3 = $.only_child(span, true);

								$.reset(button_4);

								$.template_effect(
									($0) => {
										$.set_class(button_4, 1, `w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors focus-visible-ring
                ${$.get(activeTab) === $.get(tab).id
											? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
											: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`);

										$.set_attribute(button_4, 'aria-selected', $.get(activeTab) === $.get(tab).id);
										$.set_attribute(button_4, 'id', `tab-desktop-${$.get(tab).id ?? ''}`);
										$.set_attribute(button_4, 'tabindex', $.get(activeTab) === $.get(tab).id ? 0 : -1);
										$.set_text(text_3, $0);
									},
									[() => s($.get(tab).labelKey) || $.get(tab).fallback]
								);

								$.delegated('click', button_4, () => changeTab($.get(tab).id));
								$.append($$anchor, button_4);
							});

							$.reset(div_6);
							$.reset(aside);
							$.template_effect(($0) => $.set_text(text_2, $0), [() => s("header.settings") || "Settings"]);
							$.delegated('keydown', div_6, handleTabKeydown);
							$.append($$anchor, aside);
						};

						$.if(node_5, ($$render) => {
							if (USE_SIDEBAR_LAYOUT) $$render(consequent_3);
						});
					}

					var div_7 = $.sibling(node_5, 2);

					$.set_class(div_7, 1, 'flex flex-1 flex-col overflow-hidden', null, {}, {
						'md:rounded-r-xl': USE_SIDEBAR_LAYOUT,
						'md:rounded-xl': !USE_SIDEBAR_LAYOUT
					});

					var div_8 = $.child(div_7);

					$.set_class(div_8, 1, 'hidden justify-end p-4 pb-0', null, {}, { 'md:flex': USE_SIDEBAR_LAYOUT });

					var button_5 = $.child(div_8);

					$.bind_this(button_5, ($$value) => $.set(closeButtonDesktop, $$value), () => $.get(closeButtonDesktop));
					$.reset(div_8);

					var main = $.sibling(div_8, 2);
					var node_7 = $.child(main);

					{
						var consequent_4 = ($$anchor) => {
							SettingsAppearance($$anchor, {});
						};

						var consequent_5 = ($$anchor) => {
							SettingsLanguage($$anchor, {});
						};

						var consequent_6 = ($$anchor) => {
							SettingsCategories($$anchor, {
								get categories() {
									return categories();
								}
							});
						};

						var consequent_7 = ($$anchor) => {
							SettingsStories($$anchor, {});
						};

						var consequent_8 = ($$anchor) => {
							SettingsFilters($$anchor, {});
						};

						var consequent_9 = ($$anchor) => {
							SettingsAccount($$anchor, {});
						};

						var consequent_10 = ($$anchor) => {
							SettingsAbout($$anchor, {
								get onShowAbout() {
									return $$props.onShowAbout;
								}
							});
						};

						var consequent_11 = ($$anchor) => {
							SettingsImagePreloading($$anchor, {});
						};

						$.if(node_7, ($$render) => {
							if ($.get(activeTab) === "appearance") $$render(consequent_4); else if ($.get(activeTab) === "language") $$render(consequent_5, 1); else if ($.get(activeTab) === "categories") $$render(consequent_6, 2); else if ($.get(activeTab) === "stories") $$render(consequent_7, 3); else if ($.get(activeTab) === "filters") $$render(consequent_8, 4); else if ($.get(activeTab) === "account") $$render(consequent_9, 5); else if ($.get(activeTab) === "about") $$render(consequent_10, 6); else if ($.get(activeTab) === "preloading") $$render(consequent_11, 7);
						});
					}

					$.reset(main);
					$.bind_this(main, ($$value) => $.set(scrollableElement, $$value), () => $.get(scrollableElement));
					$.reset(div_7);
					$.reset(div_1);
					$.bind_this(div_1, ($$value) => $.set(dialogElement, $$value), () => $.get(dialogElement));
					$.reset(div);

					$.template_effect(
						($0, $1, $2) => {
							$.set_text(text, $0);
							$.set_attribute(button, 'aria-label', $1);
							$.set_attribute(button_5, 'aria-label', $2);
							$.set_attribute(main, 'aria-labelledby', `tab-${$.get(activeTab) ?? ''}`);
						},
						[
							() => s("header.settings") || "Settings",
							() => s("ui.close") || "Close",
							() => s("ui.close") || "Close"
						]
					);

					$.delegated('click', div, (e) => modal.handleBackdropClick(e, handleClose));
					$.delegated('keydown', div, handleModalKeydown);
					$.delegated('click', button, handleClose);
					$.delegated('keydown', div_4, handleTabKeydown);
					$.delegated('click', button_5, handleClose);
					$.transition(3, div_1, () => fade, () => ({ duration: modal.getTransitionDuration() }));
					$.transition(3, div, () => fade, () => ({ duration: modal.getTransitionDuration() }));
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (visible()) $$render(consequent_12);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);