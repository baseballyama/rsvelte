import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<span class="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-help"><!> </span>`);
var root_1 = $.from_html(`<div class="absolute inset-0 flex items-center justify-center"><!></div>`);
var root_2 = $.from_html(`<div class="relative h-24 w-24 shrink-0 rounded bg-gray-100 dark:bg-gray-700"><!> <img alt="Article"/></div>`);
var root_3 = $.from_html(`<article class="flex space-x-4"><!> <div class="min-w-0"><a target="_blank" rel="noopener noreferrer" class="hover:underline"><h4 class="dark:text-dark-text line-clamp-2 font-semibold" dir="auto"> </h4></a> <p class="text-sm text-gray-500 dark:text-gray-400"> </p></div></article>`);
var root_4 = $.from_html(`<div class="py-6 text-center"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div> <p class="text-gray-600 dark:text-gray-400"> </p></div>`);
var root_5 = $.from_html(`<div class="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700"><h4 class="mb-3 font-medium text-gray-700 dark:text-gray-300"> </h4> <p class="text-gray-600 dark:text-gray-400 leading-relaxed" dir="auto"> </p></div>`);
var root_6 = $.from_html(`<div class="space-y-6"><div class="grid gap-4 sm:grid-cols-2"><div class="flex items-start gap-3"><div class="shrink-0 mt-0.5"><!></div> <div class="min-w-0 flex-1"><div class="font-medium text-gray-700 dark:text-gray-300 text-sm"> </div> <div class="text-gray-600 dark:text-gray-400 wrap-break-word" dir="auto"> </div></div></div> <div class="flex items-start gap-3"><div class="flex-shrink-0 mt-0.5"><!></div> <div class="min-w-0 flex-1"><div class="font-medium text-gray-700 dark:text-gray-300 text-sm"> </div> <div class="text-gray-600 dark:text-gray-400 break-words" dir="auto"> </div></div></div> <div class="flex items-start gap-3"><div class="flex-shrink-0 mt-0.5"><!></div> <div class="min-w-0 flex-1"><div class="font-medium text-gray-700 dark:text-gray-300 text-sm"> </div> <div class="text-gray-600 dark:text-gray-400 break-words" dir="auto"> </div></div></div> <div class="flex items-start gap-3"><div class="flex-shrink-0 mt-0.5"><!></div> <div class="min-w-0 flex-1"><div class="font-medium text-gray-700 dark:text-gray-300 text-sm"> </div> <div class="text-gray-600 dark:text-gray-400 break-words" dir="auto"> </div></div></div></div> <!></div>`);
var root_7 = $.from_html(`<div class="py-6 text-center"><h4 class="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200"> </h4> <p class="mb-4 text-gray-600 dark:text-gray-400"> </p> <a href="https://github.com/kagisearch/kite-public" class="inline-flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-600"><svg class="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg> </a></div>`);
var root_8 = $.from_html(`<div class="mt-4"><!></div>`);
var root_9 = $.from_html(`<div class="fixed inset-0 z-popover flex items-center justify-center bg-black/50 p-4 dark:bg-black/70" role="dialog" aria-modal="true" aria-labelledby="source-overlay-title" tabindex="-1"><div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800" role="document"><div class="max-h-[80vh] overflow-y-auto" data-overlayscrollbars-initialize=""><header class="mb-4 flex items-center justify-between"><div class="flex items-center space-x-2"><!> <h3 id="source-overlay-title" class="dark:text-dark-text text-xl font-bold" dir="auto"> </h3> <!></div> <div class="flex items-center gap-2"><button><!></button> <button class="text-gray-500 hover:text-gray-700 focus-visible-ring rounded dark:text-gray-400 dark:hover:text-gray-200" aria-label="Close source overlay"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></header> <p class="mb-4 text-gray-600 dark:text-gray-400"> </p> <div class="space-y-4"></div> <div class="mt-8 border-t border-gray-200 pt-4 dark:border-gray-700"><button class="flex w-full items-center justify-between rounded-lg p-2 text-left text-gray-800 hover:bg-gray-50 focus-visible-ring dark:text-gray-200 dark:hover:bg-gray-700"><span class="font-semibold"> </span> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button> <!></div></div></div></div>`);

export default function SourceOverlay($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let isOpen = $.prop($$props, 'isOpen', 3, false),
		sourceArticles = $.prop($$props, 'sourceArticles', 19, () => []),
		isLoadingMediaInfo = $.prop($$props, 'isLoadingMediaInfo', 3, false);

	// State for showing source info
	let showSourceInfo = $.state(false);

	// Track which article images have failed to load
	let failedImages = $.state($.proxy(new Set()));

	// Focus management
	let dialogElement = $.state(undefined);

	let firstFocusableElement = $.state(undefined);
	let lastFocusableElement = $.state(undefined);
	let previousActiveElement = null;

	// Use the fetched media info
	const mediaInfo = $.derived(() => {
		return $$props.currentMediaInfo || null;
	});

	// OverlayScrollbars setup
	let scrollableElement = $.state(undefined);

	let [initialize, instance] = useOverlayScrollbars({
		defer: true,
		options: { scrollbars: { autoHide: 'leave', autoHideDelay: 100 } }
	});

	// Initialize OverlayScrollbars
	$.user_effect(() => {
		if ($.get(scrollableElement)) {
			initialize($.get(scrollableElement));
		}
	});

	// Handle escape key
	function handleKeydown(e) {
		if (e.key === 'Escape' && isOpen()) {
			handleClose();
		}
	}

	// Focus trap handler
	function handleFocusTrap(e) {
		if (e.key !== 'Tab') return;
		if (!$.get(firstFocusableElement) || !$.get(lastFocusableElement)) return;

		if (e.shiftKey) {
			// Shift + Tab
			if (document.activeElement === $.get(firstFocusableElement)) {
				e.preventDefault();
				$.get(lastFocusableElement).focus();
			}
		} else {
			// Tab
			if (document.activeElement === $.get(lastFocusableElement)) {
				e.preventDefault();
				$.get(firstFocusableElement).focus();
			}
		}
	}

	// Get focusable elements
	function getFocusableElements() {
		if (!$.get(dialogElement)) return [];

		const focusableSelectors = [
			'button:not([disabled])',
			'[href]:not([disabled])',
			'input:not([disabled])',
			'select:not([disabled])',
			'textarea:not([disabled])',
			'[tabindex]:not([tabindex="-1"]):not([disabled])'
		];

		return Array.from($.get(dialogElement).querySelectorAll(focusableSelectors.join(', ')));
	}

	// Update focusable elements
	function updateFocusableElements() {
		const focusableElements = getFocusableElements();

		$.set(firstFocusableElement, focusableElements[0], true);
		$.set(lastFocusableElement, focusableElements[focusableElements.length - 1], true);
	}

	// Handle visibility changes for scroll lock and focus management
	$.user_effect(() => {
		if (typeof document === 'undefined') return;

		if (isOpen()) {
			// Store the previously active element
			previousActiveElement = document.activeElement;

			// Lock background scroll
			scrollLock.lock();

			// Set up keyboard listeners
			document.addEventListener('keydown', handleKeydown);

			document.addEventListener('keydown', handleFocusTrap);

			// Set initial focus after DOM updates
			setTimeout(
				() => {
					updateFocusableElements();

					if ($.get(firstFocusableElement)) {
						$.get(firstFocusableElement).focus();
					}
				},
				0
			);

			return () => {
				document.removeEventListener('keydown', handleKeydown);
				document.removeEventListener('keydown', handleFocusTrap);
				scrollLock.unlock();

				// Return focus to the previously active element without scrolling
				if (previousActiveElement && 'focus' in previousActiveElement) {
					previousActiveElement.focus({ preventScroll: true });
				}
			};
		}
	});

	// Handle close
	function handleClose() {
		if ($$props.onClose) $$props.onClose();
	}

	// Handle backdrop click
	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_8 = ($$anchor) => {
			var div = root_9();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var header = $.child(div_2);
			var div_3 = $.child(header);
			var node_1 = $.child(div_3);

			{
				let $0 = $.derived(() => $$props.currentSource?.name || "");

				let $1 = $.derived(() => $$props.currentSource?.name
					? `${$$props.currentSource.name} favicon`
					: "Generic favicon");

				FaviconImage(node_1, {
					get domain() {
						return $.get($0);
					},

					get alt() {
						return $.get($1);
					},
					class: 'h-6 w-6 rounded-sm'
				});
			}

			var h3 = $.sibling(node_1, 2);
			var text = $.only_child(h3, true);
			var node_2 = $.sibling(h3, 2);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => s("sources.paywallTooltip") || "This source may require a subscription to access full articles");

						Tooltip($$anchor, {
							get text() {
								return $.get($0);
							},
							position: 'bottom',
							children: ($$anchor, $$slotProps) => {
								var span = root();
								var node_3 = $.child(span);

								IconLock(node_3, { class: 'h-3 w-3' });

								var text_1 = $.sibling(node_3);

								$.reset(span);
								$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [() => s("sources.paywall") || "Paywall"]);
								$.append($$anchor, span);
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node_2, ($$render) => {
					if ($$props.currentSource?.isPaywalled) $$render(consequent);
				});
			}

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var button = $.child(div_4);
			let classes;
			var node_4 = $.child(button);

			{
				var consequent_1 = ($$anchor) => {
					IconPinFilled($$anchor, { class: 'h-5 w-5' });
				};

				var d = $.derived(() => preferredSources.isPreferred($$props.currentSource?.name));

				var alternate = ($$anchor) => {
					IconPin($$anchor, { class: 'h-5 w-5 group-hover:text-blue-500' });
				};

				$.if(node_4, ($$render) => {
					if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.reset(button);

			var button_1 = $.sibling(button, 2);

			$.reset(div_4);
			$.reset(header);

			var p = $.sibling(header, 2);
			var text_2 = $.only_child(p, true);
			var div_5 = $.sibling(p, 2);

			$.each(div_5, 21, sourceArticles, $.index, ($$anchor, article) => {
				var article_1 = root_3();
				var node_5 = $.child(article_1);

				{
					var consequent_3 = ($$anchor) => {
						var div_6 = root_2();
						var node_6 = $.child(div_6);

						{
							var consequent_2 = ($$anchor) => {
								var div_7 = root_1();
								var node_7 = $.child(div_7);

								{
									let $0 = $.derived(() => $$props.currentSource?.name || "");

									FaviconImage(node_7, {
										get domain() {
											return $.get($0);
										},
										alt: '',
										class: 'h-8 w-8 rounded-sm opacity-40',
										loading: 'eager'
									});
								}

								$.reset(div_7);
								$.append($$anchor, div_7);
							};

							var d_1 = $.derived(() => !$.get(failedImages).has($.get(article).link));

							$.if(node_6, ($$render) => {
								if ($.get(d_1)) $$render(consequent_2);
							});
						}

						var img = $.sibling(node_6, 2);
						let classes_1;

						$.reset(div_6);

						$.template_effect(
							($0) => {
								$.set_attribute(img, 'src', $.get(article).image);
								classes_1 = $.set_class(img, 1, 'absolute inset-0 h-24 w-24 rounded object-cover transition-opacity duration-200', null, classes_1, { 'opacity-0': $0 });
							},
							[() => !$.get(failedImages).has($.get(article).link)]
						);

						$.event('load', img, (e) => {
							e.currentTarget.style.opacity = '1';
						});

						$.event('error', img, (e) => {
							const target = e.currentTarget;

							target.style.opacity = '1';
							target.src = "/svg/placeholder.svg";
							$.set(failedImages, new Set([...$.get(failedImages), $.get(article).link]), true);
						});

						$.replay_events(img);
						$.append($$anchor, div_6);
					};

					$.if(node_5, ($$render) => {
						if ($.get(article).image) $$render(consequent_3);
					});
				}

				var div_8 = $.sibling(node_5, 2);
				var a = $.child(div_8);
				var h4 = $.child(a);
				var text_3 = $.only_child(h4, true);

				$.reset(a);

				var p_1 = $.sibling(a, 2);
				var text_4 = $.only_child(p_1);

				$.reset(div_8);
				$.reset(article_1);

				$.template_effect(
					($0, $1) => {
						$.set_attribute(a, 'href', $.get(article).link);
						$.set_text(text_3, $.get(article).title);
						h4.dir = h4.dir;
						$.set_text(text_4, `${$0 ?? ''} · ${$1 ?? ''}`);
					},
					[
						() => getTimeAgo($.get(article).date),
						() => new Date($.get(article).date).toLocaleDateString()
					]
				);

				$.delegated('click', a, (e) => e.stopPropagation());
				$.append($$anchor, article_1);
			});

			$.reset(div_5);

			var div_9 = $.sibling(div_5, 2);
			var button_2 = $.child(div_9);
			var span_1 = $.child(button_2);
			var text_5 = $.only_child(span_1, true);
			var svg = $.sibling(span_1, 2);
			let classes_2;

			$.reset(button_2);

			var node_8 = $.sibling(button_2, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_10 = root_8();
					var node_9 = $.child(div_10);

					{
						var consequent_4 = ($$anchor) => {
							var div_11 = root_4();
							var p_2 = $.sibling($.child(div_11), 2);
							var text_6 = $.only_child(p_2, true);

							$.reset(div_11);

							$.template_effect(($0) => $.set_text(text_6, $0), [
								() => s("source.info.loading") || "Loading source information..."
							]);

							$.append($$anchor, div_11);
						};

						var consequent_6 = ($$anchor) => {
							var div_12 = root_6();
							var div_13 = $.child(div_12);
							var div_14 = $.child(div_13);
							var div_15 = $.child(div_14);
							var node_10 = $.child(div_15);

							IconMapPin(node_10, { class: 'h-5 w-5 text-gray-500' });
							$.reset(div_15);

							var div_16 = $.sibling(div_15, 2);
							var div_17 = $.child(div_16);
							var text_7 = $.only_child(div_17, true);
							var div_18 = $.sibling(div_17, 2);
							var text_8 = $.only_child(div_18, true);

							$.reset(div_16);
							$.reset(div_14);

							var div_19 = $.sibling(div_14, 2);
							var div_20 = $.child(div_19);
							var node_11 = $.child(div_20);

							IconUser(node_11, { class: 'h-5 w-5 text-gray-500' });
							$.reset(div_20);

							var div_21 = $.sibling(div_20, 2);
							var div_22 = $.child(div_21);
							var text_9 = $.only_child(div_22, true);
							var div_23 = $.sibling(div_22, 2);
							var text_10 = $.only_child(div_23, true);

							$.reset(div_21);
							$.reset(div_19);

							var div_24 = $.sibling(div_19, 2);
							var div_25 = $.child(div_24);
							var node_12 = $.child(div_25);

							IconBuilding(node_12, { class: 'h-5 w-5 text-gray-500' });
							$.reset(div_25);

							var div_26 = $.sibling(div_25, 2);
							var div_27 = $.child(div_26);
							var text_11 = $.only_child(div_27, true);
							var div_28 = $.sibling(div_27, 2);
							var text_12 = $.only_child(div_28, true);

							$.reset(div_26);
							$.reset(div_24);

							var div_29 = $.sibling(div_24, 2);
							var div_30 = $.child(div_29);
							var node_13 = $.child(div_30);

							IconTag(node_13, { class: 'h-5 w-5 text-gray-500' });
							$.reset(div_30);

							var div_31 = $.sibling(div_30, 2);
							var div_32 = $.child(div_31);
							var text_13 = $.only_child(div_32, true);
							var div_33 = $.sibling(div_32, 2);
							var text_14 = $.only_child(div_33, true);

							$.reset(div_31);
							$.reset(div_29);
							$.reset(div_13);

							var node_14 = $.sibling(div_13, 2);

							{
								var consequent_5 = ($$anchor) => {
									var div_34 = root_5();
									var h4_1 = $.child(div_34);
									var text_15 = $.only_child(h4_1, true);
									var p_3 = $.sibling(h4_1, 2);
									var text_16 = $.only_child(p_3, true);

									$.reset(div_34);

									$.template_effect(
										($0) => {
											$.set_text(text_15, $0);
											$.set_text(text_16, $.get(mediaInfo)?.description);
											p_3.dir = p_3.dir;
										},
										[() => s("source.info.description") || "Description"]
									);

									$.append($$anchor, div_34);
								};

								$.if(node_14, ($$render) => {
									if ($.get(mediaInfo)?.description) $$render(consequent_5);
								});
							}

							$.reset(div_12);

							$.template_effect(
								($0, $1, $2, $3, $4) => {
									$.set_text(text_7, $0);
									$.set_text(text_8, $.get(mediaInfo)?.country);
									div_18.dir = div_18.dir;
									$.set_text(text_9, $1);
									$.set_text(text_10, $2);
									div_23.dir = div_23.dir;
									$.set_text(text_11, $3);
									$.set_text(text_12, $.get(mediaInfo)?.organization);
									div_28.dir = div_28.dir;
									$.set_text(text_13, $4);
									$.set_text(text_14, $.get(mediaInfo)?.typology);
									div_33.dir = div_33.dir;
								},
								[
									() => s("source.info.country") || "Country",
									() => s("source.info.owner") || "Owner",
									() => $.get(mediaInfo)?.owner || s("source.info.notSpecified") || "Not specified",
									() => s("source.info.organization") || "Organization",
									() => s("source.info.mediaClassification") || "Media Classification"
								]
							);

							$.append($$anchor, div_12);
						};

						var alternate_1 = ($$anchor) => {
							var div_35 = root_7();
							var h4_2 = $.child(div_35);
							var text_17 = $.only_child(h4_2, true);
							var p_4 = $.sibling(h4_2, 2);
							var text_18 = $.only_child(p_4, true);
							var a_1 = $.sibling(p_4, 2);
							var text_19 = $.sibling($.child(a_1));

							$.reset(a_1);
							$.reset(div_35);

							$.template_effect(
								($0, $1, $2) => {
									$.set_text(text_17, $0);
									$.set_text(text_18, $1);
									$.set_text(text_19, ` ${$2 ?? ''}`);
								},
								[
									() => s("source.contribute.title") || "Help Us Improve Source Information",
									() => s("source.contribute.description") || "We need your help to provide detailed information about news sources.",
									() => s("source.contribute.button") || "Contribute on GitHub"
								]
							);

							$.append($$anchor, div_35);
						};

						$.if(node_9, ($$render) => {
							if (isLoadingMediaInfo()) $$render(consequent_4); else if ($.get(mediaInfo)) $$render(consequent_6, 1); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_8, ($$render) => {
					if ($.get(showSourceInfo)) $$render(consequent_7);
				});
			}

			$.reset(div_9);
			$.reset(div_2);
			$.bind_this(div_2, ($$value) => $.set(scrollableElement, $$value), () => $.get(scrollableElement));
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(dialogElement, $$value), () => $.get(dialogElement));
			$.reset(div);

			$.template_effect(
				($0, $1, $2, $3, $4, $5) => {
					$.set_text(text, $$props.currentSource?.name || "Unknown Source");
					h3.dir = h3.dir;
					classes = $.set_class(button, 1, 'group p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible-ring', null, classes, { 'text-blue-500': $0, 'text-gray-400': $1 });
					$.set_attribute(button, 'aria-label', $2);
					$.set_attribute(button, 'title', $3);
					$.set_text(text_2, $4);
					$.set_text(text_5, $5);
					classes_2 = $.set_class(svg, 0, 'h-5 w-5 transform transition-transform', null, classes_2, { 'rotate-180': $.get(showSourceInfo) });
				},
				[
					() => preferredSources.isPreferred($$props.currentSource?.name),
					() => !preferredSources.isPreferred($$props.currentSource?.name),
					() => preferredSources.isPreferred($$props.currentSource?.name)
						? s('sources.removePreferred') || 'Unpin from top of sources'
						: s('sources.addPreferred') || 'Pin to top of sources',

					() => preferredSources.isPreferred($$props.currentSource?.name)
						? s('sources.removePreferred') || 'Unpin from top of sources'
						: s('sources.addPreferred') || 'Pin to top of sources',

					() => sourceArticles().length === 1
						? s("sources.article", { count: sourceArticles().length.toString() }) || `${sourceArticles().length} article`
						: s("sources.articles", { count: sourceArticles().length.toString() }) || `${sourceArticles().length} articles`,
					() => s("source.info.title") || "Source Information"
				]
			);

			$.delegated('click', div, handleBackdropClick);

			$.delegated('keydown', div, (e) => {
				if (e.key === "Escape") {
					handleClose();
				}
			});

			$.delegated('click', button, () => {
				if ($$props.currentSource?.name) preferredSources.togglePreferred($$props.currentSource.name);
			});

			$.delegated('click', button_1, handleClose);
			$.delegated('click', button_2, () => $.set(showSourceInfo, !$.get(showSourceInfo)));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (isOpen()) $$render(consequent_8);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);