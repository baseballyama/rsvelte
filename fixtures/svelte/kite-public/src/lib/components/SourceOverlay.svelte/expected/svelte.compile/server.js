import * as $ from 'svelte/internal/server';

import {
	IconBuilding,
	IconLock,
	IconMapPin,
	IconPin,
	IconPinFilled,
	IconTag,
	IconUser
} from '@tabler/icons-svelte';

import { useOverlayScrollbars } from 'overlayscrollbars-svelte';
import { s } from '$lib/client/localization.svelte';
import FaviconImage from '$lib/components/common/FaviconImage.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { preferredSources } from '$lib/stores/preferredSources.svelte.js';
import { getTimeAgo } from '$lib/utils/getTimeAgo';
import { scrollLock } from '$lib/utils/scrollLock.js';
import 'overlayscrollbars/overlayscrollbars.css';

export default function SourceOverlay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			isOpen = false,
			currentSource,
			sourceArticles = [],
			currentMediaInfo,
			isLoadingMediaInfo = false,
			onClose
		} = $$props;

		// State for showing source info
		let showSourceInfo = false;

		// Track which article images have failed to load
		let failedImages = new Set();

		// Focus management
		let dialogElement = undefined;

		let firstFocusableElement = undefined;
		let lastFocusableElement = undefined;
		let previousActiveElement = null;

		// Use the fetched media info
		const mediaInfo = $.derived(() => {
			return currentMediaInfo || null;
		});

		// OverlayScrollbars setup
		let scrollableElement = undefined;

		let [initialize, instance] = useOverlayScrollbars({
			defer: true,
			options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } }
		});

		// Initialize OverlayScrollbars
		// Handle escape key
		function handleKeydown(e) {
			if (e.key === 'Escape' && isOpen) {
				handleClose();
			}
		}

		// Focus trap handler
		function handleFocusTrap(e) {
			if (e.key !== 'Tab') return;
			if (!firstFocusableElement || !lastFocusableElement) return;

			if (e.shiftKey) {
				// Shift + Tab
				if (document.activeElement === firstFocusableElement) {
					e.preventDefault();
					lastFocusableElement.focus();
				}
			} else {
				// Tab
				if (document.activeElement === lastFocusableElement) {
					e.preventDefault();
					firstFocusableElement.focus();
				}
			}
		}

		// Get focusable elements
		function getFocusableElements() {
			if (!dialogElement) return [];

			const focusableSelectors = [
				'button:not([disabled])',
				'[href]:not([disabled])',
				'input:not([disabled])',
				'select:not([disabled])',
				'textarea:not([disabled])',
				'[tabindex]:not([tabindex="-1"]):not([disabled])'
			];

			return Array.from(dialogElement.querySelectorAll(focusableSelectors.join(', ')));
		}

		// Update focusable elements
		function updateFocusableElements() {
			const focusableElements = getFocusableElements();

			firstFocusableElement = focusableElements[0];
			lastFocusableElement = focusableElements[focusableElements.length - 1];
		}

		// Handle visibility changes for scroll lock and focus management
		// Store the previously active element
		// Lock background scroll
		// Set up keyboard listeners
		// Set initial focus after DOM updates
		// Return focus to the previously active element without scrolling
		// Handle close
		function handleClose() {
			if (onClose) onClose();
		}

		// Handle backdrop click
		function handleBackdropClick(event) {
			if (event.target === event.currentTarget) {
				handleClose();
			}
		}

		if (isOpen) {
			$$renderer.push(`<!--[0--><div class="fixed inset-0 z-popover flex items-center justify-center bg-black/50 p-4 dark:bg-black/70" role="dialog" aria-modal="true" aria-labelledby="source-overlay-title" tabindex="-1"><div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800" role="document"><div class="max-h-[80vh] overflow-y-auto" data-overlayscrollbars-initialize=""><header class="mb-4 flex items-center justify-between"><div class="flex items-center space-x-2">`);

			FaviconImage($$renderer, {
				domain: currentSource?.name || "",
				alt: currentSource?.name ? `${currentSource.name} favicon` : "Generic favicon",
				class: 'h-6 w-6 rounded-sm'
			});

			$$renderer.push(`<!----> <h3 id="source-overlay-title" class="dark:text-dark-text text-xl font-bold" dir="auto">${$.escape(currentSource?.name || "Unknown Source")}</h3> `);

			if (currentSource?.isPaywalled) {
				$$renderer.push('<!--[0-->');

				Tooltip($$renderer, {
					text: s("sources.paywallTooltip") || "This source may require a subscription to access full articles",
					position: 'bottom',
					children: ($$renderer) => {
						$$renderer.push(`<span class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-help">`);
						IconLock($$renderer, { class: 'h-3 w-3' });
						$$renderer.push(`<!----> ${$.escape(s("sources.paywall") || "Paywall")}</span>`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="flex items-center gap-2"><button${$.attr_class('group p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible-ring', void 0, {
				'text-blue-500': preferredSources.isPreferred(currentSource?.name),
				'text-gray-400': !preferredSources.isPreferred(currentSource?.name)
			})}${$.attr('aria-label', preferredSources.isPreferred(currentSource?.name)
				? s('sources.removePreferred') || 'Unpin from top of sources'
				: s('sources.addPreferred') || 'Pin to top of sources')}${$.attr('title', preferredSources.isPreferred(currentSource?.name)
				? s('sources.removePreferred') || 'Unpin from top of sources'
				: s('sources.addPreferred') || 'Pin to top of sources')}>`);

			if (preferredSources.isPreferred(currentSource?.name)) {
				$$renderer.push('<!--[0-->');
				IconPinFilled($$renderer, { class: 'h-5 w-5' });
			} else {
				$$renderer.push('<!--[-1-->');
				IconPin($$renderer, { class: 'h-5 w-5 group-hover:text-blue-500' });
			}

			$$renderer.push(`<!--]--></button> <button class="text-gray-500 hover:text-gray-700 focus-visible-ring rounded dark:text-gray-400 dark:hover:text-gray-200" aria-label="Close source overlay"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></header> <p class="mb-4 text-gray-600 dark:text-gray-400">${$.escape(sourceArticles.length === 1
				? s("sources.article", { count: sourceArticles.length.toString() }) || `${sourceArticles.length} article`
				: s("sources.articles", { count: sourceArticles.length.toString() }) || `${sourceArticles.length} articles`)}</p> <div class="space-y-4"><!--[-->`);

			const each_array = $.ensure_array_like(sourceArticles);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let article = each_array[$$index];

				$$renderer.push(`<article class="flex space-x-4">`);

				if (article.image) {
					$$renderer.push(`<!--[0--><div class="relative h-24 w-24 shrink-0 rounded bg-gray-100 dark:bg-gray-700">`);

					if (!failedImages.has(article.link)) {
						$$renderer.push(`<!--[0--><div class="absolute inset-0 flex items-center justify-center">`);

						FaviconImage($$renderer, {
							domain: currentSource?.name || "",
							alt: '',
							class: 'h-8 w-8 rounded-sm opacity-40',
							loading: 'eager'
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <img${$.attr('src', article.image)} alt="Article"${$.attr_class('absolute inset-0 h-24 w-24 rounded object-cover transition-opacity duration-200', void 0, { 'opacity-0': !failedImages.has(article.link) })} onload="this.__e=event" onerror="this.__e=event"/></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div class="min-w-0"><a${$.attr('href', article.link)} target="_blank" rel="noopener noreferrer" class="hover:underline"><h4 class="dark:text-dark-text line-clamp-2 font-semibold" dir="auto">${$.escape(article.title)}</h4></a> <p class="text-sm text-gray-500 dark:text-gray-400">${$.escape(getTimeAgo(article.date))} · ${$.escape(new Date(article.date).toLocaleDateString())}</p></div></article>`);
			}

			$$renderer.push(`<!--]--></div> <div class="mt-8 border-t border-gray-200 pt-4 dark:border-gray-700"><button class="flex w-full items-center justify-between rounded-lg p-2 text-left text-gray-800 hover:bg-gray-50 focus-visible-ring dark:text-gray-200 dark:hover:bg-gray-700"><span class="font-semibold">${$.escape(s("source.info.title") || "Source Information")}</span> <svg${$.attr_class('h-5 w-5 transform transition-transform', void 0, { 'rotate-180': showSourceInfo })} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button> `);

			if (showSourceInfo) {
				$$renderer.push(`<!--[0--><div class="mt-4">`);

				if (isLoadingMediaInfo) {
					$$renderer.push(`<!--[0--><div class="py-6 text-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div> <p class="text-gray-600 dark:text-gray-400">${$.escape(s("source.info.loading") || "Loading source information...")}</p></div>`);
				} else if (mediaInfo()) {
					$$renderer.push(`<!--[1--><div class="space-y-6"><div class="grid gap-4 sm:grid-cols-2"><div class="flex items-start gap-3"><div class="shrink-0 mt-0.5">`);
					IconMapPin($$renderer, { class: 'h-5 w-5 text-gray-500' });
					$$renderer.push(`<!----></div> <div class="min-w-0 flex-1"><div class="font-medium text-gray-700 dark:text-gray-300 text-sm">${$.escape(s("source.info.country") || "Country")}</div> <div class="text-gray-600 dark:text-gray-400 wrap-break-word" dir="auto">${$.escape(mediaInfo()?.country)}</div></div></div> <div class="flex items-start gap-3"><div class="flex-shrink-0 mt-0.5">`);
					IconUser($$renderer, { class: 'h-5 w-5 text-gray-500' });
					$$renderer.push(`<!----></div> <div class="min-w-0 flex-1"><div class="font-medium text-gray-700 dark:text-gray-300 text-sm">${$.escape(s("source.info.owner") || "Owner")}</div> <div class="text-gray-600 dark:text-gray-400 break-words" dir="auto">${$.escape(mediaInfo()?.owner || s("source.info.notSpecified") || "Not specified")}</div></div></div> <div class="flex items-start gap-3"><div class="flex-shrink-0 mt-0.5">`);
					IconBuilding($$renderer, { class: 'h-5 w-5 text-gray-500' });
					$$renderer.push(`<!----></div> <div class="min-w-0 flex-1"><div class="font-medium text-gray-700 dark:text-gray-300 text-sm">${$.escape(s("source.info.organization") || "Organization")}</div> <div class="text-gray-600 dark:text-gray-400 break-words" dir="auto">${$.escape(mediaInfo()?.organization)}</div></div></div> <div class="flex items-start gap-3"><div class="flex-shrink-0 mt-0.5">`);
					IconTag($$renderer, { class: 'h-5 w-5 text-gray-500' });
					$$renderer.push(`<!----></div> <div class="min-w-0 flex-1"><div class="font-medium text-gray-700 dark:text-gray-300 text-sm">${$.escape(s("source.info.mediaClassification") || "Media Classification")}</div> <div class="text-gray-600 dark:text-gray-400 break-words" dir="auto">${$.escape(mediaInfo()?.typology)}</div></div></div></div> `);

					if (mediaInfo()?.description) {
						$$renderer.push(`<!--[0--><div class="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700"><h4 class="mb-3 font-medium text-gray-700 dark:text-gray-300">${$.escape(s("source.info.description") || "Description")}</h4> <p class="text-gray-600 dark:text-gray-400 leading-relaxed" dir="auto">${$.escape(mediaInfo()?.description)}</p></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="py-6 text-center"><h4 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200">${$.escape(s("source.contribute.title") || "Help Us Improve Source Information")}</h4> <p class="mb-4 text-gray-600 dark:text-gray-400">${$.escape(s("source.contribute.description") || "We need your help to provide detailed information about news sources.")}</p> <a href="https://github.com/kagisearch/kite-public" class="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-600"><svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg> ${$.escape(s("source.contribute.button") || "Contribute on GitHub")}</a></div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}