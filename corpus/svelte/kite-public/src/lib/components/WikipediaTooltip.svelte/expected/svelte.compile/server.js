import * as $ from 'svelte/internal/server';
import { arrow, flip, offset, shift, size, useFloating } from '@skeletonlabs/floating-ui-svelte';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
import { onDestroy, onMount } from 'svelte';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { fetchWikipediaContent } from '$lib/services/wikipediaService';
import { scrollLock } from '$lib/utils/scrollLock';

export default function WikipediaTooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Language for Wikipedia lookups
		let { language = 'en', onWikipediaClick } = $$props;

		// State for dynamic sizing
		let tooltipMaxHeight = 300;

		// Floating UI setup
		const floating = useFloating({
			placement: 'bottom-start',
			strategy: 'fixed', // Use fixed positioning since we're using Portal
			middleware: [
				offset(8), // 8px gap from trigger
				flip({ fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] }), // Flip to opposite side if no space
				shift({
					padding: 8,
					crossAxis: false // Don't shift on cross axis to prevent centering
				}), // Shift within viewport with padding

				size({
					apply(
						{
							availableHeight,
							availableWidth: _availableWidth,
							elements: _elements
						}
					) {
						// Calculate optimal height based on available space
						// Min: 200px, Max: 500px or 60% of viewport height
						const minHeight = 200;

						const maxHeight = Math.min(500, window.innerHeight * 0.6);
						const optimalHeight = Math.min(Math.max(minHeight, availableHeight - 16), maxHeight);

						tooltipMaxHeight = optimalHeight;
					}
				})

				// arrow({ element: () => arrowElement }) // Arrow pointing to trigger - temporarily removed
			]
		});

		// State
		let showTooltip = false;

		let tooltipTitle = '';
		let tooltipContent = '';
		let tooltipImage = '';
		let tooltipFullImage = '';
		let tooltipWikiUrl = '';
		let currentTooltipId = '';
		let isMobile = browser ? detectMobile() : false;
		let isLoading = false;

		// Elements
		let arrowElement;

		let hideTimeout = null;

		// OverlayScrollbars instance
		let tooltipScrollbars = void 0;

		// Detect mobile device
		function detectMobile() {
			return 'ontouchstart' in window || window.innerWidth < 768;
		}

		// Handle Wikipedia link interaction
		async function handleWikipediaInteraction(event) {
			const target = event.target;

			// Find the actual Wikipedia link, even if we clicked on a child element
			const wikiLink = target.closest('a[data-wiki-id]');

			if (wikiLink) {
				const title = wikiLink.getAttribute('title') || wikiLink.textContent || '';
				const wikiId = wikiLink.getAttribute('data-wiki-id') || '';
				const tooltipId = `${wikiId}-${title}`;

				// On mobile, only handle click events (ignore mouseover/mouseenter)
				if (isMobile) {
					if (event.type !== 'click') {
						return; // Skip hover events on mobile
					}

					event.preventDefault(); // Prevent default link behavior
				}

				// For desktop hovers, skip if already showing same tooltip
				if (!isMobile && event.type === 'mouseover' && showTooltip && currentTooltipId === tooltipId) {
					// Cancel any pending hide timeout since we're still on the same element
					if (hideTimeout) {
						clearTimeout(hideTimeout);
						hideTimeout = null;
					}

					return;
				}

				// Clear any existing timeout
				if (hideTimeout) {
					clearTimeout(hideTimeout);
					hideTimeout = null;
				}

				// Set reference element for floating UI - use the actual link element
				floating.elements.reference = wikiLink;

				// Set initial state
				currentTooltipId = tooltipId;

				tooltipTitle = title;
				tooltipContent = '';
				tooltipImage = '';
				tooltipFullImage = '';
				tooltipWikiUrl = ''; // Will be set by API response
				isLoading = true;

				// Show tooltip - the floating element will be bound when the template renders
				showTooltip = true;

				// Debug logging (commented out)
				// setTimeout(() => {
				//   console.log('Floating UI state after timeout:', {
				//     reference: floating.elements.reference,
				//     floating: floating.elements.floating,
				//     isPositioned: floating.isPositioned,
				//     showTooltip
				//   });
				// }, 0);
				// Fetch Wikipedia content using the provided language
				try {
					const loadedData = await fetchWikipediaContent(wikiId, language);

					// Update tooltip if it's still showing for the same ID
					if (showTooltip && currentTooltipId === tooltipId) {
						tooltipContent = loadedData?.extract || 'No summary available.';
						tooltipImage = loadedData?.thumbnail?.source || '';
						tooltipFullImage = loadedData?.originalImage?.source || tooltipImage;
						tooltipWikiUrl = loadedData?.wikiUrl || tooltipWikiUrl;
						isLoading = false;

						// Update scrollbars after content loads
						setTimeout(
							() => {
								if (tooltipScrollbars?.osInstance) {
									tooltipScrollbars.osInstance().update(true);
								}
							},
							10
						);
					}
				} catch(error) {
					console.error('Error loading Wikipedia content:', error);

					if (showTooltip && currentTooltipId === tooltipId) {
						tooltipContent = 'Failed to load Wikipedia content.';
						isLoading = false;
					}
				}
			}
		}

		// Handle mouse leave from Wikipedia link
		function handleWikipediaLeave(event) {
			if (isMobile) return; // Mobile tooltips are manually closed

			const relatedTarget = event.relatedTarget;
			const tooltip = floating.elements.floating;
			const reference = floating.elements.reference;

			// If moving to the tooltip itself, don't hide it
			if (tooltip && relatedTarget && tooltip.contains(relatedTarget)) {
				return;
			}

			// Key improvement: Check if we're moving to ANY part of the same Wikipedia link
			// This treats the entire link as a single hover zone
			if (relatedTarget && relatedTarget instanceof Element) {
				const targetWikiLink = relatedTarget.closest('a[data-wiki-id]');
				const currentWikiLink = reference;

				// If we're moving to the same Wikipedia link (same data-wiki-id), don't hide
				if (targetWikiLink && currentWikiLink && targetWikiLink.getAttribute('data-wiki-id') === currentWikiLink.getAttribute('data-wiki-id')) {
					return;
				}
			}

			// Simple timeout with reduced delay since we have unified hover zone
			hideTimeout = window.setTimeout(
				() => {
					hideTooltip();
				},
				150
			); // Short delay for smooth UX
		}

		// Handle tooltip mouse leave
		function handleTooltipLeave(event) {
			if (isMobile) return;

			const relatedTarget = event.relatedTarget;
			const reference = floating.elements.reference;

			// If moving back to the Wikipedia link, don't hide
			if (relatedTarget && relatedTarget instanceof Element) {
				const targetWikiLink = relatedTarget.closest('a[data-wiki-id]');
				const currentWikiLink = reference;

				// If we're moving to the same Wikipedia link (same data-wiki-id), don't hide
				if (targetWikiLink && currentWikiLink && targetWikiLink.getAttribute('data-wiki-id') === currentWikiLink.getAttribute('data-wiki-id')) {
					return;
				}
			}

			// Simple timeout - if we're truly leaving, hide the tooltip
			hideTimeout = window.setTimeout(
				() => {
					hideTooltip();
				},
				150
			); // Consistent short delay
		}

		// Handle tooltip mouse enter (cancel hide timeout)
		function handleTooltipEnter() {
			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout = null;
			}
		}

		// Hide tooltip
		function hideTooltip() {
			showTooltip = false;
			currentTooltipId = '';
			isLoading = false;
		}

		// Close mobile modal
		function closeMobileModal() {
			hideTooltip();
		}

		// Lock/unlock page scroll for mobile
		// Hide tooltip on scroll (desktop only)
		function hideTooltipOnScroll() {
			if (!isMobile && showTooltip) {
				hideTooltip();
			}
		}

		// Setup scroll listener
		onMount(() => {
			if (browser) {
				window.addEventListener('scroll', hideTooltipOnScroll, { passive: true });
			}
		});

		onDestroy(() => {
			if (hideTimeout) {
				clearTimeout(hideTimeout);
			}

			if (browser) {
				window.removeEventListener('scroll', hideTooltipOnScroll);
			}
		});

		if (showTooltip) {
			$$renderer.push('<!--[0-->');

			if (!isMobile) {
				$$renderer.push('<!--[0-->');

				Portal($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div${$.attr_class(`absolute top-0 left-0 z-tooltip w-80 max-w-[min(320px,calc(100vw-16px))] rounded-lg border border-gray-300 bg-white shadow-lg transition-opacity duration-200 dark:border-gray-600 dark:bg-gray-700 ${floating.isPositioned ? 'opacity-100' : 'opacity-0 invisible'}`)}${$.attr_style(floating.floatingStyles)} role="tooltip">`);

						OverlayScrollbarsComponent($$renderer, {
							class: 'w-full overflow-hidden transition-[max-height] duration-200',
							style: `max-height: ${$.stringify(tooltipMaxHeight)}px`,
							options: {
								overflow: { x: "hidden", y: "scroll" },
								scrollbars: { autoHide: "leave", autoHideDelay: 300 }
							},

							children: ($$renderer) => {
								$$renderer.push(`<div class="p-3"><h4 class="mb-2 font-semibold text-gray-800 dark:text-gray-200 break-words">${$.escape(tooltipTitle)}</h4> `);

								if (isLoading) {
									$$renderer.push(`<!--[0--><div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"><div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div> <span>Loading...</span></div>`);
								} else {
									$$renderer.push('<!--[-1-->');

									if (tooltipImage) {
										$$renderer.push(`<!--[0--><img${$.attr('src', tooltipImage)}${$.attr('alt', tooltipTitle)} class="mb-2 w-full rounded h-auto object-contain"/>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <p class="text-sm text-gray-600 dark:text-gray-400 break-words" dir="auto">${$.escape(tooltipContent)}</p>`);
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');

				Portal($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div class="fixed inset-0 z-tooltip flex items-center justify-center bg-black/60 dark:bg-black/80" role="dialog" aria-modal="true" aria-labelledby="wikipedia-modal-title" tabindex="-1"><div class="flex h-full w-full flex-col bg-white shadow-xl dark:bg-gray-800" role="presentation"><div class="flex items-center border-b border-gray-200 p-4 dark:border-gray-700"><button class="mr-3 rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"${$.attr('aria-label', s("common.back"))}><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg></button> <h3 id="wikipedia-modal-title" class="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100">${$.escape(tooltipTitle)}</h3></div> `);

						OverlayScrollbarsComponent($$renderer, {
							class: 'flex-1 overflow-hidden',
							options: {
								overflow: { x: "hidden", y: "scroll" },
								scrollbars: { autoHide: "leave", autoHideDelay: 300 }
							},

							children: ($$renderer) => {
								$$renderer.push(`<div class="p-4">`);

								if (isLoading) {
									$$renderer.push(`<!--[0--><div class="flex items-center justify-center space-x-2 py-8 text-gray-500 dark:text-gray-400"><div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div> <span>Loading Wikipedia content...</span></div>`);
								} else {
									$$renderer.push('<!--[-1-->');

									if (tooltipFullImage || tooltipImage) {
										$$renderer.push(`<!--[0--><img${$.attr('src', tooltipFullImage || tooltipImage)}${$.attr('alt', tooltipTitle)} class="mb-4 w-full rounded-lg object-contain"/>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <p class="text-gray-700 dark:text-gray-300" dir="auto">${$.escape(tooltipContent)}</p> `);

									if (tooltipWikiUrl) {
										$$renderer.push(`<!--[0--><a${$.attr('href', tooltipWikiUrl)} target="_blank" rel="noopener noreferrer" class="mt-4 inline-block rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">${$.escape(s("wikipedia.readMore"))}</a>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { handleWikipediaInteraction, handleWikipediaLeave });
	});
}