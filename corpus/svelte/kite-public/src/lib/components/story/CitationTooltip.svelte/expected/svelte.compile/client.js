import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip, offset, shift, size, useFloating } from '@skeletonlabs/floating-ui-svelte';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';
import { onDestroy, onMount } from 'svelte';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { scrollLock } from '$lib/utils/scrollLock';
import CitationItem from './CitationItem.svelte';

var root = $.from_html(`<div class="p-3"><h4 class="mb-3 font-semibold text-gray-800 dark:text-gray-200">Citations</h4> <div class="space-y-2"><!></div></div>`);
var root_1 = $.from_html(`<div role="tooltip"><!></div>`);
var root_2 = $.from_html(`<div class="p-4"><h4 class="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Citations</h4> <div class="space-y-3"><!></div></div>`);
var root_3 = $.from_html(`<div class="fixed inset-0 z-tooltip flex items-center justify-center bg-black/60 dark:bg-black/80" role="dialog" aria-modal="true" aria-labelledby="citations-modal-title" tabindex="-1"><div class="flex h-full w-full flex-col bg-white shadow-xl dark:bg-gray-800" role="presentation"><div class="flex items-center border-b border-gray-200 p-4 dark:border-gray-700"><button class="mr-3 rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg></button> <h3 id="citations-modal-title" class="flex-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Source Articles</h3></div> <!></div></div>`);

export default function CitationTooltip($$anchor, $$props) {
	$.push($$props, true);

	// The actual global citation numbers
	// Whether [*] appears in the text
	// All cited items including common knowledge
	// Story-specific localization function
	let hasCommonKnowledge = $.prop($$props, 'hasCommonKnowledge', 3, false),
		citedItems = $.prop($$props, 'citedItems', 19, () => []),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s // Use regular localization if not provided
		);

	// State for dynamic sizing
	let tooltipMaxHeight = $.state(300);

	// Floating UI setup
	const floating = useFloating({
		placement: 'bottom-start',
		strategy: 'fixed',
		middleware: [
			offset(8),
			flip({ fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] }),
			shift({ padding: 8, crossAxis: false }),
			size({
				apply({ availableHeight }) {
					const minHeight = 200;
					const maxHeight = Math.min(400, window.innerHeight * 0.6);
					const optimalHeight = Math.min(Math.max(minHeight, availableHeight - 16), maxHeight);

					$.set(tooltipMaxHeight, optimalHeight, true);
				}
			})
		]
	});

	// State
	let showTooltip = $.state(false);

	let currentTooltipId = $.state('');
	let isMobile = $.state(false);
	let highlightedNumbers = $.state($.proxy([] // Support multiple highlighted numbers for grouped citations
	));
	let hideTimeout = null;
	let isClickToggled = $.state(false // Track if tooltip was toggled by click on desktop
	);
	let pendingFocusTimeout = null; // Delay focus events to avoid conflicts with clicks
	let lastTouchTime = 0; // Track last touch to ignore mouseover from touch

	// OverlayScrollbars instance
	let tooltipScrollbars = $.state(void 0);

	// Detect mobile device
	function detectMobile() {
		// Check if this is primarily a touch device without mouse support
		// This properly distinguishes between:
		// - Touch-only devices (phones/tablets): mobile behavior
		// - Mouse devices (desktop/laptop, including small screens): desktop behavior
		// - Devices with both (laptops with touchscreen): desktop behavior
		const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

		const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

		// It's mobile only if it has touch but no mouse (pure touch device)
		return hasTouch && !hasMouse;
	}

	// Record touch time to ignore subsequent mouseover
	function recordTouch() {
		lastTouchTime = Date.now();
	}

	// Handle citation interaction
	async function handleCitationInteraction(
		event,
		domains,
		highlightNumber // Support single number or array for grouped citations
	) {
		const target = event.target;

		// Clear any pending focus timeout when any new event comes in
		if (pendingFocusTimeout) {
			clearTimeout(pendingFocusTimeout);
			pendingFocusTimeout = null;
		}

		// Find the citation wrapper or use the target itself (for individual citation numbers)
		const citationWrapper = target.closest('.citation-sources') || target;

		if (citationWrapper) {
			const tooltipId = `citations-${domains.join('-')}`;

			$.set(isMobile, detectMobile(), true);

			// For mobile clicks, prevent default and show modal
			if ($.get(isMobile) && event.type === 'click') {
				event.preventDefault();
			}

			// Desktop click behavior - toggle tooltip
			if (!$.get(isMobile) && event.type === 'click') {
				event.preventDefault();
				event.stopPropagation(); // Stop propagation to prevent any parent handlers

				// If tooltip is already showing for this citation, hide it
				if ($.get(showTooltip) && $.get(currentTooltipId) === tooltipId) {
					hideTooltip();

					return;
				}

				// Mark that this was toggled by click
				$.set(isClickToggled, true);
			}

			// Normalize highlightNumber to array
			const highlightArray = highlightNumber
				? Array.isArray(highlightNumber) ? highlightNumber : [highlightNumber]
				: [];

			// For desktop hovers, only proceed if not click-toggled or it's a different tooltip
			if (!$.get(isMobile) && event.type === 'mouseover') {
				// Ignore mouseover if it comes within 500ms of a touch (touch triggers mouseover)
				if (Date.now() - lastTouchTime < 500) {
					return;
				}

				// Don't interfere with click-toggled tooltips unless it's a different citation
				if ($.get(isClickToggled) && $.get(showTooltip) && $.get(currentTooltipId) === tooltipId) {
					// Just update highlighted numbers if needed
					if (highlightArray.length > 0 && JSON.stringify($.get(highlightedNumbers)) !== JSON.stringify(highlightArray)) {
						$.set(highlightedNumbers, highlightArray, true);

						setTimeout(
							() => {
								scrollToHighlightedCitation(Math.min(...highlightArray));
							},
							50
						);
					}

					return;
				}

				// Reset click toggle state when hovering over a new citation
				$.set(isClickToggled, false);

				// If tooltip is already showing for this citation, just update highlight
				if ($.get(showTooltip) && $.get(currentTooltipId) === tooltipId) {
					if (hideTimeout) {
						clearTimeout(hideTimeout);
						hideTimeout = null;
					}

					// Update highlighted numbers and scroll if needed
					if (highlightArray.length > 0 && JSON.stringify($.get(highlightedNumbers)) !== JSON.stringify(highlightArray)) {
						$.set(highlightedNumbers, highlightArray, true);

						setTimeout(
							() => {
								scrollToHighlightedCitation(Math.min(...highlightArray));
							},
							50
						);
					}

					return;
				}
			}

			// For mobile hover, ignore it completely
			if ($.get(isMobile) && event.type === 'mouseover') {
				return;
			}

			// Clear any existing timeout
			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout = null;
			}

			// Set reference element for floating UI
			floating.elements.reference = citationWrapper;

			// Set highlighted numbers (array)
			$.set(highlightedNumbers, highlightArray, true);

			// Set initial state
			$.set(currentTooltipId, tooltipId);

			$.set(showTooltip, true);

			// Auto-scroll to first (lowest) highlighted citation after tooltip is rendered
			if (highlightArray.length > 0) {
				setTimeout(
					() => {
						scrollToHighlightedCitation(Math.min(...highlightArray));
					},
					50
				);
			}
		}
	}

	// Handle mouse leave from citation sources
	function handleCitationLeave(event) {
		if ($.get(isMobile)) return;

		// If tooltip was toggled by click, don't hide on mouse leave
		if ($.get(isClickToggled)) return;

		const relatedTarget = event.relatedTarget;
		const tooltip = floating.elements.floating;
		const reference = floating.elements.reference;

		// If moving to the tooltip itself, don't hide it
		if (tooltip && relatedTarget && tooltip.contains(relatedTarget)) {
			return;
		}

		// If we're moving to the same citation wrapper, don't hide
		if (relatedTarget && relatedTarget instanceof Element) {
			const targetWrapper = relatedTarget.closest('.citation-sources');

			if (targetWrapper && targetWrapper === reference) {
				return;
			}
		}

		hideTimeout = window.setTimeout(
			() => {
				hideTooltip();
			},
			150
		);
	}

	// Handle tooltip mouse leave
	function handleTooltipLeave(event) {
		if ($.get(isMobile)) return;

		// If tooltip was toggled by click, don't hide on mouse leave
		if ($.get(isClickToggled)) return;

		const relatedTarget = event.relatedTarget;
		const reference = floating.elements.reference;

		// If moving back to the citation sources, don't hide
		if (relatedTarget && relatedTarget instanceof Element) {
			const targetWrapper = relatedTarget.closest('.citation-sources');

			if (targetWrapper && targetWrapper === reference) {
				return;
			}
		}

		hideTimeout = window.setTimeout(
			() => {
				hideTooltip();
			},
			150
		);
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
		$.set(highlightedNumbers, [], true);
		$.set(isClickToggled, false);
	}

	// Scroll to highlighted citation in tooltip
	function scrollToHighlightedCitation(citationNumber) {
		if (!$.get(tooltipScrollbars)?.osInstance || !$.get(showTooltip)) return;

		// Find the highlighted citation element by its actual citation number
		const highlightedElement = floating.elements.floating?.querySelector(`[data-citation-number="${citationNumber}"]`);

		if (highlightedElement) {
			// Scroll the highlighted element into view within the tooltip
			highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

			// Also update the OverlayScrollbars instance
			setTimeout(
				() => {
					$.get(tooltipScrollbars).osInstance()?.update(true);
				},
				25
			);
		}
	}

	// Close mobile modal
	function closeMobileModal() {
		hideTooltip();
	}

	// Lock/unlock page scroll for mobile
	$.user_effect(() => {
		if ($.get(isMobile) && $.get(showTooltip)) {
			scrollLock.lock();

			return () => scrollLock.unlock();
		}
	});

	// Hide tooltip on scroll (desktop only)
	function hideTooltipOnScroll() {
		if (!$.get(isMobile) && $.get(showTooltip)) {
			hideTooltip();
		}
	}

	// Handle click outside to close click-toggled tooltips
	function handleClickOutside(event) {
		if (!$.get(isClickToggled) || !$.get(showTooltip) || $.get(isMobile)) return;

		const target = event.target;
		const tooltip = floating.elements.floating;
		const reference = floating.elements.reference;

		// Check if click is outside both tooltip and reference
		// Note: reference could be a VirtualElement, so check if it has contains method
		if (tooltip && !tooltip.contains(target) && reference && 'contains' in reference && !reference.contains(target)) {
			hideTooltip();
		}
	}

	// Setup scroll listener
	onMount(() => {
		if (browser) {
			window.addEventListener('scroll', hideTooltipOnScroll, { passive: true });
			window.addEventListener('click', handleClickOutside, { capture: true });
		}
	});

	onDestroy(() => {
		if (hideTimeout) {
			clearTimeout(hideTimeout);
		}

		if (pendingFocusTimeout) {
			clearTimeout(pendingFocusTimeout);
		}

		if (browser) {
			window.removeEventListener('scroll', hideTooltipOnScroll);
			window.removeEventListener('click', handleClickOutside, { capture: true });
		}
	});

	var $$exports = { recordTouch, handleCitationInteraction, handleCitationLeave };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var node_2 = $.child(div);

							$.bind_this(
								OverlayScrollbarsComponent(node_2, {
									class: 'w-full overflow-hidden transition-[max-height] duration-200',
									get style() {
										return `max-height: ${$.get(tooltipMaxHeight) ?? ''}px`;
									},
									defer: true,
									options: {
										overflow: { x: "hidden", y: "scroll" },
										scrollbars: { autoHide: "leave", autoHideDelay: 300 }
									},

									children: ($$anchor, $$slotProps) => {
										var div_1 = root();
										var div_2 = $.sibling($.child(div_1), 2);
										var node_3 = $.child(div_2);

										{
											var consequent = ($$anchor) => {
												const uniqueItems = $.derived(() => (() => {
													const seen = new Set();
													const unique = [];

													for (const item of citedItems()) {
														if (item.isCommon) {
															// Only add common knowledge once
															if (!seen.has("common")) {
																seen.add("common");
																unique.push(item);
															}
														} else if (item.article) {
															// Only add each unique article once (by link as unique identifier)
															const articleKey = item.article.link;

															if (!seen.has(articleKey)) {
																seen.add(articleKey);
																unique.push(item);
															}
														}
													}

													return unique;
												})());

												var fragment_3 = $.comment();
												var node_4 = $.first_child(fragment_3);

												$.each(node_4, 17, () => $.get(uniqueItems), $.index, ($$anchor, item) => {
													CitationItem($$anchor, {
														get item() {
															return $.get(item);
														},

														get highlightedNumbers() {
															return $.get(highlightedNumbers);
														},

														get storyLocalizer() {
															return storyLocalizer();
														}
													});
												});

												$.append($$anchor, fragment_3);
											};

											$.if(node_3, ($$render) => {
												if (citedItems().length > 0) $$render(consequent);
											});
										}

										$.reset(div_2);
										$.reset(div_1);
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

				var alternate = ($$anchor) => {
					Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_3 = root_3();
							var div_4 = $.child(div_3);
							var div_5 = $.child(div_4);
							var button = $.child(div_5);

							$.next(2);
							$.reset(div_5);

							var node_5 = $.sibling(div_5, 2);

							OverlayScrollbarsComponent(node_5, {
								class: 'flex-1 overflow-hidden',
								defer: true,
								options: {
									overflow: { x: "hidden", y: "scroll" },
									scrollbars: { autoHide: "leave", autoHideDelay: 300 }
								},

								children: ($$anchor, $$slotProps) => {
									var div_6 = root_2();
									var div_7 = $.sibling($.child(div_6), 2);
									var node_6 = $.child(div_7);

									{
										var consequent_2 = ($$anchor) => {
											const uniqueItems = $.derived(() => (() => {
												const seen = new Set();
												const unique = [];

												for (const item of citedItems()) {
													if (item.isCommon) {
														// Only add common knowledge once
														if (!seen.has("common")) {
															seen.add("common");
															unique.push(item);
														}
													} else if (item.article) {
														// Only add each unique article once (by link as unique identifier)
														const articleKey = item.article.link;

														if (!seen.has(articleKey)) {
															seen.add(articleKey);
															unique.push(item);
														}
													}
												}

												return unique;
											})());

											var fragment_6 = $.comment();
											var node_7 = $.first_child(fragment_6);

											$.each(node_7, 17, () => $.get(uniqueItems), $.index, ($$anchor, item) => {
												CitationItem($$anchor, {
													get item() {
														return $.get(item);
													},

													get highlightedNumbers() {
														return $.get(highlightedNumbers);
													},
													isMobile: true,
													get storyLocalizer() {
														return storyLocalizer();
													}
												});
											});

											$.append($$anchor, fragment_6);
										};

										$.if(node_6, ($$render) => {
											if (citedItems().length > 0) $$render(consequent_2);
										});
									}

									$.reset(div_7);
									$.reset(div_6);
									$.append($$anchor, div_6);
								},
								$$slots: { default: true }
							});

							$.reset(div_4);
							$.reset(div_3);
							$.template_effect(($0) => $.set_attribute(button, 'aria-label', $0), [() => storyLocalizer()("common.back")]);
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
					if (!$.get(isMobile)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(showTooltip)) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click', 'keydown']);