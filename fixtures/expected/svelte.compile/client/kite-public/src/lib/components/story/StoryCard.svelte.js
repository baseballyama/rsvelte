import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { createStoryLocalizer } from '$lib/client/storyLocalization.svelte';
import { readingLevelSettings } from '$lib/data/settings.svelte';
import { useHoverPreloading, useViewportPreloading } from '$lib/hooks/useImagePreloading.svelte';
import { useStoryFlashcards } from '$lib/hooks/useStoryFlashcards.svelte';
import { useStorySimplification } from '$lib/hooks/useStorySimplification.svelte';
import { useStoryTTS } from '$lib/hooks/useStoryTTS.svelte';
import StoryActions from './StoryActions.svelte';
import StoryContentSkeleton from './StoryContentSkeleton.svelte';
import StoryHeader from './StoryHeader.svelte';
import StorySectionManager from './StorySectionManager.svelte';

var root = $.from_html(`<div class="dark:bg-dark-bg flex flex-col bg-white py-4 [&amp;>section:first-of-type]:mt-0" role="region" aria-label="Story content"><!> <!></div>`);
var root_1 = $.from_html(`<span class="text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-black/30 px-2 py-0.5 rounded"> </span>`);
var root_2 = $.from_html(`<span class="text-xs text-gray-600 dark:text-gray-400"> </span>`);
var root_3 = $.from_html(`<div class="absolute left-0 top-4 z-dropdown flex items-center gap-3 px-4" role="alert" aria-live="polite"><span class="text-sm font-medium text-gray-700 dark:text-gray-300"> </span> <div class="flex items-center gap-2"><!> <!></div> <span class="text-xs text-gray-600 dark:text-gray-400 italic"> </span></div>`);
var root_4 = $.from_html(`<article><div><!> <!></div> <!></article>`);

export default function StoryCard($$anchor, $$props) {
	$.push($$props, true);

	// Props
	// For high-priority stories (first few visible)
	// Story opened from URL/link
	// Story selected via keyboard navigation
	let batchDateSlug = $.prop($$props, 'batchDateSlug', 3, null),
		isRead = $.prop($$props, 'isRead', 3, false),
		isExpanded = $.prop($$props, 'isExpanded', 3, false),
		shouldAutoScroll = $.prop($$props, 'shouldAutoScroll', 3, false),
		showSourceOverlay = $.prop($$props, 'showSourceOverlay', 15, false),
		currentSource = $.prop($$props, 'currentSource', 15, null),
		sourceArticles = $.prop($$props, 'sourceArticles', 31, () => $.proxy([])),
		currentMediaInfo = $.prop($$props, 'currentMediaInfo', 15, null),
		isLoadingMediaInfo = $.prop($$props, 'isLoadingMediaInfo', 15, false),
		priority = $.prop($$props, 'priority', 3, false),
		isFiltered = $.prop($$props, 'isFiltered', 3, false),
		filterKeywords = $.prop($$props, 'filterKeywords', 19, () => []),
		isSharedView = $.prop($$props, 'isSharedView', 3, false),
		isLinkedStory = $.prop($$props, 'isLinkedStory', 3, false),
		isKeyboardSelected = $.prop($$props, 'isKeyboardSelected', 3, false);

	// Story element reference
	let storyElement = undefined; // Assigned via bind:this

	// Blur state - re-check filtering in real-time
	// Track if blurred state should be synced with isFiltered prop
	const isFilteredProp = $.derived(isFiltered);

	let isBlurred = $.state(false);

	// Track if we're actively revealing (for transition)
	let isRevealing = $.state(false);

	// Sync blur state with filter prop when it changes
	$.user_effect(() => {
		// Reset blur state to match current filter state
		$.set(isBlurred, $.get(isFilteredProp), true);

		// Reset revealing state when filter changes
		$.set(isRevealing, false);
	});

	// Determine language code from story
	const storyLanguageCode = $.derived(() => $$props.story.sourceLanguage || 'en');

	// Get the default reading level for this category
	const categoryDefaultLevel = $.derived(() => $$props.categoryId
		? readingLevelSettings.getForCategory($$props.categoryId)
		: undefined);

	// Feature composables - each handles its own state and logic
	// svelte-ignore state_referenced_locally - storyLanguageCode is intentionally captured at initialization
	const simplification = useStorySimplification($$props.story, $.get(storyLanguageCode), {
		defaultLevel: $.get(categoryDefaultLevel),
		autoSimplify: !!$.get(categoryDefaultLevel) && $.get(categoryDefaultLevel) !== 'normal'
	});

	// svelte-ignore state_referenced_locally - storyLanguageCode is intentionally captured at initialization
	const flashcards = useStoryFlashcards($$props.story, $.get(storyLanguageCode));

	const tts = useStoryTTS(() => simplification.current);

	// Use simplified story if available, otherwise use original
	const displayStory = $.derived(() => simplification.current);

	// Create story-specific localization function
	// Pass the story's actual source language when available
	const ss = $.derived(() => createStoryLocalizer(isExpanded(), $$props.story.sourceLanguage));

	// Use hooks for preloading
	// svelte-ignore state_referenced_locally - story prop is stable per component instance
	const viewportPreloader = useViewportPreloading(() => storyElement, $$props.story, { priority: priority() });

	// svelte-ignore state_referenced_locally - story prop is stable per component instance
	const hoverPreloader = useHoverPreloading($$props.story, { priority: priority() });

	// Track if images are preloaded
	const imagesPreloaded = $.derived(() => viewportPreloader.isPreloaded || hoverPreloader.isPreloaded);

	// Trigger auto-simplification when story expands
	$.user_effect(() => {
		if (isExpanded() && !isSharedView()) {
			simplification.triggerAutoSimplify();
		}
	});

	// Handle story click
	function handleStoryClick() {
		// In shared view mode, don't allow toggling/closing
		if (isSharedView()) return;

		// If blurred, reveal
		if ($.get(isBlurred)) {
			$.set(isRevealing, true);
			$.set(isBlurred, false);

			// If story is not yet expanded, expand it after a small delay
			if (!isExpanded()) {
				setTimeout(
					() => {
						if ($$props.onToggle) $$props.onToggle();
					},
					100
				);
			}

			// Reset revealing state after animation completes
			setTimeout(
				() => {
					$.set(isRevealing, false);
				},
				300
			);

			return;
		}

		// If we're closing the story (isExpanded is true), clean up all features
		if (isExpanded()) {
			tts.stop();
			simplification.reset();
			flashcards.reset();
		}

		if ($$props.onToggle) $$props.onToggle();
	}

	// Handle read toggle click
	function handleReadClick(e) {
		e.stopPropagation();

		if ($$props.onReadToggle) $$props.onReadToggle();
	}

	// Scroll to story when expanded
	$.user_effect(() => {
		if (isExpanded() && browser && storyElement && shouldAutoScroll()) {
			// Small delay to ensure the content is rendered
			setTimeout(
				() => {
					// Calculate dynamic header height and offsets
					const headerEl = document.querySelector('header') || document.querySelector('nav');

					const headerHeight = headerEl ? headerEl.offsetHeight : 60;

					// Mobile vs desktop offsets - smaller offset for more precise positioning
					const isMobile = window.innerWidth <= 768;

					const extraOffset = isMobile ? 8 : 12;

					// Find the category element within this story for precise positioning
					const categoryElement = storyElement.querySelector('.category-label');

					let rect;
					let elementTop;

					if (categoryElement) {
						// Use the category element directly for most precise positioning
						rect = categoryElement.getBoundingClientRect();

						elementTop = window.pageYOffset + rect.top - 28;
					} else throw new Error('Category element not found');

					// Calculate the ideal scroll position to show the category nicely below the header
					const idealScrollPosition = elementTop - headerHeight - extraOffset;

					// Check if the category is properly positioned below the header
					const requiredMargin = headerHeight + extraOffset;

					const isProperlyVisible = rect.top >= requiredMargin && rect.top <= requiredMargin + 20;

					// Only scroll if not properly positioned
					if (!isProperlyVisible) {
						const finalScrollPosition = Math.max(0, idealScrollPosition);

						window.scrollTo({ top: finalScrollPosition, behavior: 'smooth' });
					}
				},
				150
			);
		}
	});

	var article = root_4();
	var div = $.child(article);
	let classes;
	var node = $.child(div);

	StoryHeader(node, {
		get story() {
			return $.get(displayStory);
		},

		get isRead() {
			return isRead();
		},

		get isSharedView() {
			return isSharedView();
		},

		get isExpanded() {
			return isExpanded();
		},
		onTitleClick: handleStoryClick,
		onReadClick: handleReadClick,
		get onFlashcardsClick() {
			return flashcards.toggle;
		},

		get onExportClick() {
			return flashcards.exportFlashcards;
		},

		get onDownloadClick() {
			return flashcards.download;
		},

		get onTtsClick() {
			return tts.play;
		},

		get onTtsDownloadClick() {
			return tts.download;
		},

		get ttsStatus() {
			return tts.status;
		},

		get onSimplifyLevelSelect() {
			return simplification.selectLevel;
		},

		get selectedLevel() {
			return simplification.selectedLevel;
		},

		get isSimplifying() {
			return simplification.isLoading;
		},

		get flashcardMode() {
			return flashcards.enabled;
		},

		get isExporting() {
			return flashcards.isExporting;
		},

		get exportedCSV() {
			return flashcards.exportedCSV;
		},

		get selectedWordsCount() {
			return flashcards.selectedCount;
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root();
			var node_2 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					StoryContentSkeleton($$anchor, {
						get readingLevel() {
							return simplification.defaultLevel;
						}
					});
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => flashcards.enabled && !flashcards.isExporting);

						StorySectionManager($$anchor, {
							get story() {
								return $.get(displayStory);
							},

							get imagesPreloaded() {
								return $.get(imagesPreloaded);
							},

							get storyLocalizer() {
								return $.get(ss);
							},

							get flashcardMode() {
								return $.get($0);
							},

							get selectedWords() {
								return flashcards.selectedWords;
							},

							get selectedPhrases() {
								return flashcards.selectedPhrases;
							},

							get shouldJiggle() {
								return flashcards.shouldJiggle;
							},

							get onWordClick() {
								return flashcards.selectWord;
							},

							get showSourceOverlay() {
								return showSourceOverlay();
							},

							set showSourceOverlay($$value) {
								showSourceOverlay($$value);
							},

							get currentSource() {
								return currentSource();
							},

							set currentSource($$value) {
								currentSource($$value);
							},

							get sourceArticles() {
								return sourceArticles();
							},

							set sourceArticles($$value) {
								sourceArticles($$value);
							},

							get currentMediaInfo() {
								return currentMediaInfo();
							},

							set currentMediaInfo($$value) {
								currentMediaInfo($$value);
							},

							get isLoadingMediaInfo() {
								return isLoadingMediaInfo();
							},

							set isLoadingMediaInfo($$value) {
								isLoadingMediaInfo($$value);
							}
						});
					}
				};

				$.if(node_2, ($$render) => {
					if (simplification.isLoading && simplification.isAutoSimplified) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			StoryActions(node_3, {
				get story() {
					return $.get(displayStory);
				},

				get batchId() {
					return $$props.batchId;
				},

				get batchDateSlug() {
					return batchDateSlug();
				},

				get categoryId() {
					return $$props.categoryId;
				},

				get storyIndex() {
					return $$props.storyIndex;
				},
				onClose: handleStoryClick,
				get isSharedView() {
					return isSharedView();
				},

				get storyLocalizer() {
					return $.get(ss);
				}
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (isExpanded()) $$render(consequent_1);
		});
	}

	$.reset(div);

	var node_4 = $.sibling(div, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_2 = root_3();
			var span = $.child(div_2);
			var text = $.only_child(span, true);
			var div_3 = $.sibling(span, 2);
			var node_5 = $.child(div_3);

			$.each(node_5, 17, () => filterKeywords().slice(0, 3), $.index, ($$anchor, keyword) => {
				var span_1 = root_1();
				var text_1 = $.only_child(span_1, true);

				$.template_effect(() => $.set_text(text_1, $.get(keyword)));
				$.append($$anchor, span_1);
			});

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_2 = ($$anchor) => {
					var span_2 = root_2();
					var text_2 = $.only_child(span_2);

					$.template_effect(() => $.set_text(text_2, `+${filterKeywords().length - 3}`));
					$.append($$anchor, span_2);
				};

				$.if(node_6, ($$render) => {
					if (filterKeywords().length > 3) $$render(consequent_2);
				});
			}

			$.reset(div_3);

			var span_3 = $.sibling(div_3, 2);
			var text_3 = $.only_child(span_3, true);

			$.reset(div_2);

			$.template_effect(
				($0, $1) => {
					$.set_text(text, $0);
					$.set_text(text_3, $1);
				},
				[
					() => isLinkedStory()
						? s("contentFilter.linkedStoryFilteredBecause") || "The story you wanted to view is blocked by your content filter:"
						: s("contentFilter.filteredBecause") || "Hidden due to filter:",

					() => isLinkedStory()
						? s("contentFilter.linkedStoryClickToReveal") || "Click to show anyway"
						: s("contentFilter.clickToReveal") || "Click to show"
				]
			);

			$.append($$anchor, div_2);
		};

		$.if(node_4, ($$render) => {
			if ($.get(isBlurred) && filterKeywords() && filterKeywords().length > 0) $$render(consequent_3);
		});
	}

	$.reset(article);
	$.bind_this(article, ($$value) => storyElement = $$value, () => storyElement);

	$.template_effect(
		($0) => {
			$.set_attribute(article, 'id', `story-${$$props.story.cluster_number ?? ''}`);
			$.set_attribute(article, 'data-story-id', $0);
			$.set_attribute(article, 'data-story-index', $$props.storyIndex);
			$.set_attribute(article, 'aria-label', `News story: ${$$props.story.title ?? ''}`);

			$.set_class(article, 1, `relative py-2 transition-all duration-200 ${isKeyboardSelected()
				? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/10 -mx-2 px-2 rounded-lg'
				: ''} ${$.get(isBlurred) ? 'cursor-pointer' : ''} ${!isExpanded() ? 'border-b border-gray-200 dark:border-gray-700' : ''}`);

			$.set_attribute(article, 'role', $.get(isBlurred) ? "button" : undefined);
			$.set_attribute(article, 'tabindex', $.get(isBlurred) ? 0 : undefined);

			classes = $.set_class(div, 1, '', null, classes, {
				'transition-all': $.get(isRevealing),
				'duration-200': $.get(isRevealing),
				'blur-lg': $.get(isBlurred),
				'pointer-events-none': $.get(isBlurred)
			});
		},
		[
			() => $$props.story.cluster_number?.toString() || $$props.story.title
		]
	);

	$.event('mouseenter', article, function (...$$args) {
		hoverPreloader.handleMouseEnter?.apply(this, $$args);
	});

	$.event('mouseleave', article, function (...$$args) {
		hoverPreloader.handleMouseLeave?.apply(this, $$args);
	});

	$.event('focus', article, function (...$$args) {
		hoverPreloader.handleMouseEnter?.apply(this, $$args);
	});

	$.delegated('click', article, function (...$$args) {
		($.get(isBlurred) ? handleStoryClick : undefined)?.apply(this, $$args);
	});

	$.delegated('keydown', article, function (...$$args) {
		($.get(isBlurred)
			? (e) => e.key === "Enter" && handleStoryClick()
			: undefined)?.apply(this, $$args);
	});

	$.append($$anchor, article);
	$.pop();
}

$.delegate(['click', 'keydown']);