import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { arrow, flip, offset, shift, size, useFloating } from '@skeletonlabs/floating-ui-svelte';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
import { onDestroy, onMount } from 'svelte';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { fetchWikipediaContent } from '$lib/services/wikipediaService';
import { scrollLock } from '$lib/utils/scrollLock';

var root = $.from_html(`<div class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"><div class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div> <span>Loading...</span></div>`);
var root_1 = $.from_html(`<img class="mb-2 w-full rounded h-auto object-contain"/>`);
var root_2 = $.from_html(`<!> <p class="text-sm text-gray-600 dark:text-gray-400 break-words" dir="auto"> </p>`, 1);
var root_3 = $.from_html(`<div class="p-3"><h4 class="mb-2 font-semibold text-gray-800 dark:text-gray-200 break-words"> </h4> <!></div>`);
var root_4 = $.from_html(`<div role="tooltip"><!></div>`);
var root_5 = $.from_html(`<div class="flex items-center justify-center space-x-2 py-8 text-gray-500 dark:text-gray-400"><div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div> <span>Loading Wikipedia content...</span></div>`);
var root_6 = $.from_html(`<img class="mb-4 w-full rounded-lg object-contain"/>`);
var root_7 = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="mt-4 inline-block rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"> </a>`);
var root_8 = $.from_html(`<!> <p class="text-gray-700 dark:text-gray-300" dir="auto"> </p> <!>`, 1);
var root_9 = $.from_html(`<div class="p-4"><!></div>`);
var root_10 = $.from_html(`<div class="fixed inset-0 z-tooltip flex items-center justify-center bg-black/60 dark:bg-black/80" role="dialog" aria-modal="true" aria-labelledby="wikipedia-modal-title" tabindex="-1"><div class="flex h-full w-full flex-col bg-white shadow-xl dark:bg-gray-800" role="presentation"><div class="flex items-center border-b border-gray-200 p-4 dark:border-gray-700"><button class="mr-3 rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg></button> <h3 id="wikipedia-modal-title" class="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100"> </h3></div> <!></div></div>`);

export default function WikipediaTooltip($$anchor, $$props) {
	$.push($$props, true);

	// Language for Wikipedia lookups
	let language = $.prop($$props, 'language', 3, 'en');

	// State for dynamic sizing
	let tooltipMaxHeight = $.state(300);

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

					$.set(tooltipMaxHeight, optimalHeight, true);
				}
			})

			// arrow({ element: () => arrowElement }) // Arrow pointing to trigger - temporarily removed
		]
	});

	// State
	let showTooltip = $.state(false);

	let tooltipTitle = $.state('');
	let tooltipContent = $.state('');
	let tooltipImage = $.state('');
	let tooltipFullImage = $.state('');
	let tooltipWikiUrl = $.state('');
	let currentTooltipId = $.state('');
	let isMobile = $.proxy(browser ? detectMobile() : false);
	let isLoading = $.state(false);

	// Elements
	let arrowElement;

	let hideTimeout = null;

	// OverlayScrollbars instance
	let tooltipScrollbars = $.state(void 0);

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
			if (!isMobile && event.type === 'mouseover' && $.get(showTooltip) && $.get(currentTooltipId) === tooltipId) {
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
			$.set(currentTooltipId, tooltipId);

			$.set(tooltipTitle, title, true);
			$.set(tooltipContent, '');
			$.set(tooltipImage, '');
			$.set(tooltipFullImage, '');
			$.set(tooltipWikiUrl, '' // Will be set by API response
			);
			$.set(isLoading, true);

			// Show tooltip - the floating element will be bound when the template renders
			$.set(showTooltip, true);

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
				const loadedData = await fetchWikipediaContent(wikiId, language());

				// Update tooltip if it's still showing for the same ID
				if ($.get(showTooltip) && $.get(currentTooltipId) === tooltipId) {
					$.set(tooltipContent, loadedData?.extract || 'No summary available.', true);
					$.set(tooltipImage, loadedData?.thumbnail?.source || '', true);
					$.set(tooltipFullImage, loadedData?.originalImage?.source || $.get(tooltipImage), true);
					$.set(tooltipWikiUrl, loadedData?.wikiUrl || $.get(tooltipWikiUrl), true);
					$.set(isLoading, false);

					// Update scrollbars after content loads
					setTimeout(
						() => {
							if ($.get(tooltipScrollbars)?.osInstance) {
								$.get(tooltipScrollbars).osInstance().update(true);
							}
						},
						10
					);
				}
			} catch(error) {
				console.error('Error loading Wikipedia content:', error);

				if ($.get(showTooltip) && $.get(currentTooltipId) === tooltipId) {
					$.set(tooltipContent, 'Failed to load Wikipedia content.');
					$.set(isLoading, false);
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
		$.set(showTooltip, false);
		$.set(currentTooltipId, '');
		$.set(isLoading, false);
	}

	// Close mobile modal
	function closeMobileModal() {
		hideTooltip();
	}

	// Lock/unlock page scroll for mobile
	$.user_effect(() => {
		if (isMobile && $.get(showTooltip)) {
			scrollLock.lock();

			return () => scrollLock.unlock();
		}
	});

	// Hide tooltip on scroll (desktop only)
	function hideTooltipOnScroll() {
		if (!isMobile && $.get(showTooltip)) {
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

	var $$exports = { handleWikipediaInteraction, handleWikipediaLeave };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_2 = ($$anchor) => {
					Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_4();
							var node_2 = $.child(div);

							$.bind_this(
								OverlayScrollbarsComponent(node_2, {
									class: 'w-full overflow-hidden transition-[max-height] duration-200',
									get style() {
										return `max-height: ${$.get(tooltipMaxHeight) ?? ''}px`;
									},

									options: {
										overflow: { x: "hidden", y: "scroll" },
										scrollbars: { autoHide: "leave", autoHideDelay: 300 }
									},

									children: ($$anchor, $$slotProps) => {
										var div_1 = root_3();
										var h4 = $.child(div_1);
										var text = $.only_child(h4, true);
										var node_3 = $.sibling(h4, 2);

										{
											var consequent = ($$anchor) => {
												var div_2 = root();

												$.append($$anchor, div_2);
											};

											var alternate = ($$anchor) => {
												var fragment_3 = root_2();
												var node_4 = $.first_child(fragment_3);

												{
													var consequent_1 = ($$anchor) => {
														var img = root_1();

														$.template_effect(() => {
															$.set_attribute(img, 'src', $.get(tooltipImage));
															$.set_attribute(img, 'alt', $.get(tooltipTitle));
														});

														$.append($$anchor, img);
													};

													$.if(node_4, ($$render) => {
														if ($.get(tooltipImage)) $$render(consequent_1);
													});
												}

												var p = $.sibling(node_4, 2);
												var text_1 = $.only_child(p, true);

												$.template_effect(() => {
													$.set_text(text_1, $.get(tooltipContent));
													p.dir = p.dir;
												});

												$.append($$anchor, fragment_3);
											};

											$.if(node_3, ($$render) => {
												if ($.get(isLoading)) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.reset(div_1);
										$.template_effect(() => $.set_text(text, $.get(tooltipTitle)));
										$.append($$anchor, div_1);
									},
									$$slots: { default: true }
								}),
								($$value) => $.set(tooltipScrollbars, $$value, true),
								() => $.get(tooltipScrollbars)
							);

							$.reset(div);
							$.bind_this(div, ($$value) => floating.elements.floating = $$value, () => floating?.elements?.floating);

							$.template_effect(() => {
								$.set_class(div, 1, `absolute top-0 left-0 z-tooltip w-80 max-w-[min(320px,calc(100vw-16px))] rounded-lg border border-gray-300 bg-white shadow-lg transition-opacity duration-200 dark:border-gray-600 dark:bg-gray-700 ${floating.isPositioned ? 'opacity-100' : 'opacity-0 invisible'}`);
								$.set_style(div, floating.floatingStyles);
							});

							$.event('mouseenter', div, handleTooltipEnter);
							$.event('mouseleave', div, handleTooltipLeave);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				};

				var alternate_2 = ($$anchor) => {
					Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_3 = root_10();
							var div_4 = $.child(div_3);
							var div_5 = $.child(div_4);
							var button = $.child(div_5);
							var h3 = $.sibling(button, 2);
							var text_2 = $.only_child(h3, true);

							$.reset(div_5);

							var node_5 = $.sibling(div_5, 2);

							OverlayScrollbarsComponent(node_5, {
								class: 'flex-1 overflow-hidden',
								options: {
									overflow: { x: "hidden", y: "scroll" },
									scrollbars: { autoHide: "leave", autoHideDelay: 300 }
								},

								children: ($$anchor, $$slotProps) => {
									var div_6 = root_9();
									var node_6 = $.child(div_6);

									{
										var consequent_3 = ($$anchor) => {
											var div_7 = root_5();

											$.append($$anchor, div_7);
										};

										var alternate_1 = ($$anchor) => {
											var fragment_5 = root_8();
											var node_7 = $.first_child(fragment_5);

											{
												var consequent_4 = ($$anchor) => {
													var img_1 = root_6();

													$.template_effect(() => {
														$.set_attribute(img_1, 'src', $.get(tooltipFullImage) || $.get(tooltipImage));
														$.set_attribute(img_1, 'alt', $.get(tooltipTitle));
													});

													$.append($$anchor, img_1);
												};

												$.if(node_7, ($$render) => {
													if ($.get(tooltipFullImage) || $.get(tooltipImage)) $$render(consequent_4);
												});
											}

											var p_1 = $.sibling(node_7, 2);
											var text_3 = $.only_child(p_1, true);
											var node_8 = $.sibling(p_1, 2);

											{
												var consequent_5 = ($$anchor) => {
													var a = root_7();
													var text_4 = $.only_child(a, true);

													$.template_effect(
														($0) => {
															$.set_attribute(a, 'href', $.get(tooltipWikiUrl));
															$.set_text(text_4, $0);
														},
														[() => s("wikipedia.readMore")]
													);

													$.append($$anchor, a);
												};

												$.if(node_8, ($$render) => {
													if ($.get(tooltipWikiUrl)) $$render(consequent_5);
												});
											}

											$.template_effect(() => {
												$.set_text(text_3, $.get(tooltipContent));
												p_1.dir = p_1.dir;
											});

											$.append($$anchor, fragment_5);
										};

										$.if(node_6, ($$render) => {
											if ($.get(isLoading)) $$render(consequent_3); else $$render(alternate_1, -1);
										});
									}

									$.reset(div_6);
									$.append($$anchor, div_6);
								},
								$$slots: { default: true }
							});

							$.reset(div_4);
							$.reset(div_3);

							$.template_effect(
								($0) => {
									$.set_attribute(button, 'aria-label', $0);
									$.set_text(text_2, $.get(tooltipTitle));
								},
								[() => s("common.back")]
							);

							$.delegated('click', div_3, closeMobileModal);
							$.delegated('keydown', div_3, (e) => e.key === "Escape" && closeMobileModal());
							$.delegated('click', div_4, (e) => e.stopPropagation());
							$.delegated('keydown', div_4, (e) => e.stopPropagation());
							$.delegated('click', button, closeMobileModal);
							$.append($$anchor, div_3);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_1, ($$render) => {
					if (!isMobile) $$render(consequent_2); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(showTooltip)) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click', 'keydown']);