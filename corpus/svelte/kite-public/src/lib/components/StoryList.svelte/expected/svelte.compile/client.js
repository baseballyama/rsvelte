import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconClock, IconInfoCircle } from '@tabler/icons-svelte';
import { s } from '$lib/client/localization.svelte';
import { categorySettings, displaySettings } from '$lib/data/settings.svelte.js';
import { kiteDB } from '$lib/db/dexie';
import { contentFilter } from '$lib/stores/contentFilter.svelte.js';
import { categoryMetadataStore } from '$lib/stores/categoryMetadata.svelte';
import { keyboardNavigation } from '$lib/stores/keyboardNavigation.svelte';
import { timeTravelBatch } from '$lib/stores/timeTravelBatch.svelte';
import { filterStories } from '$lib/utils/contentFilter';
import ClusteringExplainerModal from './ClusteringExplainerModal.svelte';
import StoryCard from './story/StoryCard.svelte';

var root = $.from_html(`<p class="text-base font-medium mb-2"> </p> <p class="text-sm mb-4"> </p> <div class="flex flex-col sm:flex-row gap-2 justify-center"><button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"> </button> <button class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"> </button></div>`, 1);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<div class="max-w-md mx-auto"><p class="text-base font-medium mb-2"> </p> <p class="text-sm mb-4"> </p> <button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 inline-flex items-center gap-1.5"><!> </button></div>`);
var root_3 = $.from_html(`<div class="max-w-md mx-auto"><div class="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-3"><!> <span class="text-sm font-medium"> </span></div> <p class="text-base"> </p></div>`);
var root_4 = $.from_html(`<div class="py-8 text-center text-gray-500 dark:text-gray-400"><!></div>`);
var root_5 = $.from_html(`<div class="mb-4 mt-8 first:mt-0 category-section-header"><h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b-2 border-gray-300 dark:border-gray-600 pb-2"> </h2></div>`);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"><p><!></p></div>`);
var root_8 = $.from_html(`<div class="mt-6 py-4 text-center text-gray-600 dark:text-gray-400"><p class="text-base"> </p></div>`);
var root_9 = $.from_html(`<div class="mt-6 w-full text-center"><button class="w-full rounded-lg bg-gray-100 px-6 py-3 text-gray-800 transition-colors duration-200 hover:bg-gray-200 md:w-auto dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"> </button></div>`);
var root_10 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_11 = $.from_html(`<div class="story-list"><!></div> <!>`, 1);

export default function StoryList($$anchor, $$props) {
	$.push($$props, true);

	// Props
	// Date slug with sequence number for share URLs
	// For new URL format
	// Show category labels for single page mode
	// Skip story count limit (for single page mode)
	let stories = $.prop($$props, 'stories', 19, () => []),
		batchDateSlug = $.prop($$props, 'batchDateSlug', 3, null),
		readStories = $.prop($$props, 'readStories', 31, () => $.proxy({})),
		expandedStories = $.prop($$props, 'expandedStories', 31, () => $.proxy({})),
		showSourceOverlay = $.prop($$props, 'showSourceOverlay', 15, false),
		currentSource = $.prop($$props, 'currentSource', 15, null),
		sourceArticles = $.prop($$props, 'sourceArticles', 31, () => $.proxy([])),
		currentMediaInfo = $.prop($$props, 'currentMediaInfo', 15, null),
		isLoadingMediaInfo = $.prop($$props, 'isLoadingMediaInfo', 15, false),
		storyCountOverride = $.prop($$props, 'storyCountOverride', 3, null),
		isSharedView = $.prop($$props, 'isSharedView', 3, false),
		sharedArticleIndex = $.prop($$props, 'sharedArticleIndex', 3, null),
		sharedClusterId = $.prop($$props, 'sharedClusterId', 3, null),
		initiallyExpandedIndex = $.prop($$props, 'initiallyExpandedIndex', 3, null),
		showCategoryLabels = $.prop($$props, 'showCategoryLabels', 3, false),
		skipStoryCountLimit = $.prop($$props, 'skipStoryCountLimit', 3, false);

	// Modal state
	let showClusteringModal = $.state(false);

	// Whether the current category is community (not core)
	const isCommunityCategory = $.derived(() => {
		const metadata = categoryMetadataStore.findById($$props.currentCategory);

		return metadata ? !metadata.isCore : false;
	});

	// Handle story toggle
	function handleStoryToggle(story) {
		// Use UUID as primary identifier for uniqueness across categories
		// Fall back to cluster_number or title for backwards compatibility
		const storyId = story.id || story.cluster_number?.toString() || story.title;

		if ($$props.onStoryToggle) {
			$$props.onStoryToggle(storyId);
		}
	}

	// Track sequence numbers to ignore stale responses
	const toggleSequence = new Map();

	// Handle read status toggle
	async function handleReadToggle(story) {
		if (!story.id) return; // Skip if no UUID

		const storyId = story.id; // Use UUID directly

		// Increment sequence number for this story
		const currentSeq = (toggleSequence.get(storyId) || 0) + 1;

		toggleSequence.set(storyId, currentSeq);

		const wasRead = readStories()[storyId] || false;
		const isNowRead = !wasRead;

		// Optimistic UI update - show immediately for instant feedback
		if (isNowRead) {
			readStories(readStories()[storyId] = true, true);
		} else {
			delete readStories()[storyId];
		}

		readStories({ ...readStories() } // Trigger reactivity
		);

		// Persist to database in background
		if (isNowRead) {
			if (story.id) {
				await kiteDB.markStoryAsRead(story.id, story.title, $$props.batchId, $$props.categoryUuid);
			}
		} else {
			if (story.id) {
				await kiteDB.unmarkStoryAsRead(story.id, $$props.batchId, $$props.categoryUuid);
			}
		}

		// After DB write, check if sequence changed - if so, a newer operation is in charge
		const latestSeq = toggleSequence.get(storyId);

		if (latestSeq !== currentSeq) {
			return;
		}
	}

	// Mark all as read
	async function markAllAsRead() {
		$.get(displayedStories).forEach(async (story) => {
			if (!story.id) return; // Skip if no UUID

			const storyId = story.id; // Use UUID directly

			readStories(readStories()[storyId] = true, true);

			// Persist to database
			if (story.id) {
				// Only mark if we have a UUID
				await kiteDB.markStoryAsRead(
					story.id, // cluster UUID
					story.title,
					$$props.batchId,
					$$props.categoryUuid
				);
			}
		});
	}

	// Expand or collapse all stories
	function toggleExpandAll() {
		const expand = !$.get(allStoriesExpanded);

		// When collapsing, this is simple - just collapse all
		if (!expand) {
			expandedStories({});

			return;
		}

		// Expand all at once
		const newExpanded = { ...expandedStories() };

		$.get(displayedStories).forEach((story) => {
			const id = story.id || story.cluster_number?.toString() || story.title;

			newExpanded[id] = true;
		});

		expandedStories(newExpanded);
	}

	// Toggle read status by index (for keyboard navigation)
	function toggleReadStatus(index) {
		const story = $.get(displayedStories)[index];

		if (story) {
			handleReadToggle(story);
		}
	}

	// Apply content filtering and story count limit
	const $$d = $.derived(() => {
			// If in shared view mode, only show the specific shared article
			if (isSharedView()) {
				let sharedStory;

				console.log('🔍 [StoryList] Shared view mode - finding story:', {
					sharedArticleIndex: sharedArticleIndex(),
					sharedClusterId: sharedClusterId(),
					storiesCount: stories().length,
					expandedStories: expandedStories(),
					firstStory: stories()[0]?.title,
					firstCluster: stories()[0]?.cluster_number
				});

				// First try to find by UUID from expandedStories (most reliable)
				const expandedStoryId = Object.keys(expandedStories()).find((id) => expandedStories()[id]);

				if (expandedStoryId) {
					sharedStory = stories().find((s) => s.id === expandedStoryId || s.cluster_number?.toString() === expandedStoryId || s.title === expandedStoryId);
					console.log('🔍 [StoryList] Found by expandedStoryId:', expandedStoryId, '->', sharedStory?.title);
				} else // Fall back to index (legacy format)
				if (sharedArticleIndex() !== null && stories()[sharedArticleIndex()]) {
					sharedStory = stories()[sharedArticleIndex()];
					console.log('🔍 [StoryList] Found by index:', sharedStory?.title);
				} else // Fall back to clusterId (old format, unreliable in single page mode)
				if (sharedClusterId() !== null) {
					sharedStory = stories().find((s) => s.cluster_number === sharedClusterId());
					console.log('🔍 [StoryList] Found by clusterId:', sharedClusterId(), '->', sharedStory?.title);
				}

				if (sharedStory) {
					console.log('✅ [StoryList] Showing shared story:', sharedStory.title);

					return {
						displayedStories: [sharedStory],
						filteredCount: 0,
						hiddenStories: stories().filter((s) => s !== sharedStory)
					};
				} else {
					console.warn('❌ [StoryList] Shared story not found!');
				}
			}

			// First apply story count limit
			// In single page mode, stories are already limited per category in orderStoriesForSinglePage
			// So we skip the limit here to show all stories from all categories
			// Use override if provided (e.g., from URL navigation), otherwise use user setting
			const effectiveLimit = storyCountOverride() ?? displaySettings.storyCount;

			const limitedStories = skipStoryCountLimit() ? stories() : stories().slice(0, effectiveLimit);

			// Then apply content filtering if active (has keywords)
			if (contentFilter.isActive) {
				const result = filterStories(limitedStories, contentFilter.keywords, contentFilter.filterScope, contentFilter.filterMode);

				return {
					displayedStories: result.filtered,
					filteredCount: result.filteredCount,
					hiddenStories: result.hidden
				};
			}

			return {
				displayedStories: limitedStories,
				filteredCount: 0,
				hiddenStories: []
			};
		}),
		displayedStories = $.derived(() => $.get($$d).displayedStories),
		filteredCount = $.derived(() => $.get($$d).filteredCount),
		hiddenStories = $.derived(() => $.get($$d).hiddenStories);

	// Check if all stories are read
	const allStoriesRead = $.derived(() => $.get(displayedStories).every((story) => story.id && readStories()[story.id]));

	// Check if all stories are expanded
	const allStoriesExpanded = $.derived(() => $.get(displayedStories).length > 0 && $.get(displayedStories).every((story) => expandedStories()[story.cluster_number?.toString() || story.title]));

	var $$exports = { toggleExpandAll, toggleReadStatus };
	var fragment = root_11();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_4();
			var node_1 = $.child(div_1);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root();
					var p = $.first_child(fragment_1);
					var text = $.only_child(p, true);
					var p_1 = $.sibling(p, 2);
					var text_1 = $.only_child(p_1, true);
					var div_2 = $.sibling(p_1, 2);
					var button = $.child(div_2);
					var text_2 = $.only_child(button, true);
					var button_1 = $.sibling(button, 2);
					var text_3 = $.only_child(button_1, true);

					$.reset(div_2);

					$.template_effect(
						($0, $1, $2, $3) => {
							$.set_text(text, $0);
							$.set_text(text_1, $1);
							$.set_text(text_2, $2);
							$.set_text(text_3, $3);
						},
						[
							() => s("contentFilter.allStoriesFiltered") || "All stories in this category were filtered",
							() => s("contentFilter.allStoriesFilteredDescription") || "Your content filters have hidden all stories in this category for today.",
							() => s("contentFilter.adjustFilters") || "Adjust filters",
							() => s("contentFilter.disableCategory") || "Disable category"
						]
					);

					$.delegated('click', button, () => window.location.href = "#settings/contentFilter");

					$.delegated('click', button_1, () => {
						// Only disable if we have more than one enabled category
						if (categorySettings.enabled.length > 1) {
							categorySettings.disableCategory($$props.currentCategory);

							// Navigate to the first enabled category after disabling
							const firstEnabled = categorySettings.enabled[0];

							if (firstEnabled && firstEnabled !== $$props.currentCategory) {
								window.location.href = `#${firstEnabled}`;
							} else {
								// If current was the first, find the new first
								const newEnabled = categorySettings.enabled.filter((cat) => cat !== $$props.currentCategory);

								if (newEnabled.length > 0) {
									window.location.href = `#${newEnabled[0]}`;
								}
							}
						} else {
							// If only one category is enabled, just navigate to settings
							window.location.href = "#settings/categories";
						}
					});

					$.append($$anchor, fragment_1);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent_1 = ($$anchor) => {
							var p_2 = root_1();
							var text_4 = $.only_child(p_2, true);

							$.template_effect(($0) => $.set_text(text_4, $0), [
								() => s("stories.noStoriesHistorical") || "This category had no news on this date."
							]);

							$.append($$anchor, p_2);
						};

						var consequent_2 = ($$anchor) => {
							var div_3 = root_2();
							var p_3 = $.child(div_3);
							var text_5 = $.only_child(p_3, true);
							var p_4 = $.sibling(p_3, 2);
							var text_6 = $.only_child(p_4, true);
							var button_2 = $.sibling(p_4, 2);
							var node_3 = $.child(button_2);

							IconInfoCircle(node_3, { size: 16 });

							var text_7 = $.sibling(node_3);

							$.reset(button_2);
							$.reset(div_3);

							$.template_effect(
								($0, $1, $2) => {
									$.set_text(text_5, $0);
									$.set_text(text_6, $1);
									$.set_text(text_7, ` ${$2 ?? ''}`);
								},
								[
									() => s("stories.noStoriesCommunity") || "No stories for this community category today.",
									() => s("stories.noStoriesCommunityDescription") || "Not enough shared news between feeds to form stories. This happens sometimes with community categories.",
									() => s("stories.noStoriesCommunityLearnMore") || "Learn how it works"
								]
							);

							$.delegated('click', button_2, () => $.set(showClusteringModal, true));
							$.append($$anchor, div_3);
						};

						var alternate = ($$anchor) => {
							var div_4 = root_3();
							var div_5 = $.child(div_4);
							var node_4 = $.child(div_5);

							IconClock(node_4, { size: 20 });

							var span = $.sibling(node_4, 2);
							var text_8 = $.only_child(span, true);

							$.reset(div_5);

							var p_5 = $.sibling(div_5, 2);
							var text_9 = $.only_child(p_5, true);

							$.reset(div_4);

							$.template_effect(
								($0, $1) => {
									$.set_text(text_8, $0);
									$.set_text(text_9, $1);
								},
								[
									() => s("stories.noStoriesCoreUpdates") || "Temporarily unavailable",
									() => s("stories.noStoriesCore") || "Stories for this category should be available soon. Check back in a bit."
								]
							);

							$.append($$anchor, div_4);
						};

						$.if(node_2, ($$render) => {
							if (timeTravelBatch.isHistoricalBatch) $$render(consequent_1); else if ($.get(isCommunityCategory)) $$render(consequent_2, 1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if (contentFilter.isActive && $.get(filteredCount) > 0 && contentFilter.filterMode === "hide") $$render(consequent); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate_3 = ($$anchor) => {
			var fragment_3 = root_10();
			var node_5 = $.first_child(fragment_3);

			$.each(node_5, 19, () => $.get(displayedStories), (story) => story.id || story.cluster_number || story.title, ($$anchor, story, index) => {
				const isFiltered = $.derived(() => contentFilter.filterMode === "blur" && $.get(story)._filtered);
				const isLinkedStory = $.derived(() => initiallyExpandedIndex() === $.get(index));
				const isKeyboardSelected = $.derived(() => keyboardNavigation.selectedIndex === $.get(index));
				const storyWithCategory = $.derived(() => $.get(story));
				const categoryId = $.derived(() => $.get(storyWithCategory)._categoryId || $$props.currentCategory);
				const categoryName = $.derived(() => $.get(storyWithCategory)._categoryName);
				const prevStoryWithCategory = $.derived(() => $.get(index) > 0 ? $.get(displayedStories)[$.get(index) - 1] : null);
				const showCategoryHeader = $.derived(() => showCategoryLabels() && !isSharedView() && $.get(categoryName) && ($.get(index) === 0 || $.get(categoryId) !== $.get(prevStoryWithCategory)?._categoryId));
				var fragment_4 = root_6();
				var node_6 = $.first_child(fragment_4);

				{
					var consequent_4 = ($$anchor) => {
						var div_6 = root_5();
						var h2 = $.child(div_6);
						var text_10 = $.only_child(h2, true);

						$.reset(div_6);

						$.template_effect(() => {
							$.set_attribute(div_6, 'data-category-id', $.get(categoryId));
							$.set_text(text_10, $.get(categoryName));
						});

						$.append($$anchor, div_6);
					};

					$.if(node_6, ($$render) => {
						if ($.get(showCategoryHeader)) $$render(consequent_4);
					});
				}

				var node_7 = $.sibling(node_6, 2);

				{
					let $0 = $.derived(() => $.get(story).id && readStories()[$.get(story).id] || false);
					let $1 = $.derived(() => expandedStories()[$.get(story).id || $.get(story).cluster_number?.toString() || $.get(story).title] || false);
					let $2 = $.derived(() => !$.get(allStoriesExpanded));
					let $3 = $.derived(() => $.get(index) < 3);

					StoryCard(node_7, {
						get story() {
							return $.get(story);
						},

						get storyIndex() {
							return $.get(index);
						},

						get batchId() {
							return $$props.batchId;
						},

						get batchDateSlug() {
							return batchDateSlug();
						},

						get categoryId() {
							return $.get(categoryId);
						},

						get isRead() {
							return $.get($0);
						},

						get isExpanded() {
							return $.get($1);
						},

						get shouldAutoScroll() {
							return $.get($2);
						},
						onToggle: () => handleStoryToggle($.get(story)),
						onReadToggle: () => handleReadToggle($.get(story)),
						get priority() {
							return $.get($3);
						},

						get isFiltered() {
							return $.get(isFiltered);
						},

						get filterKeywords() {
							return $.get(story)._matchedKeywords;
						},

						get isSharedView() {
							return isSharedView();
						},

						get isLinkedStory() {
							return $.get(isLinkedStory);
						},

						get isKeyboardSelected() {
							return $.get(isKeyboardSelected);
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

				$.append($$anchor, fragment_4);
			});

			var node_8 = $.sibling(node_5, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_7 = root_7();
					var p_6 = $.child(div_7);
					var node_9 = $.child(p_6);

					{
						var consequent_5 = ($$anchor) => {
							var text_11 = $.text();

							$.template_effect(($0) => $.set_text(text_11, $0), [
								() => $.get(filteredCount) === 1
									? s("contentFilter.storyHidden", { count: $.get(filteredCount).toString() })
									: s("contentFilter.storiesHidden", { count: $.get(filteredCount).toString() })
							]);

							$.append($$anchor, text_11);
						};

						var alternate_2 = ($$anchor) => {
							var text_12 = $.text();

							$.template_effect(($0) => $.set_text(text_12, $0), [
								() => $.get(filteredCount) === 1
									? s("contentFilter.storyFiltered", { count: $.get(filteredCount).toString() })
									: s("contentFilter.storiesFiltered", { count: $.get(filteredCount).toString() })
							]);

							$.append($$anchor, text_12);
						};

						$.if(node_9, ($$render) => {
							if (contentFilter.filterMode === "hide") $$render(consequent_5); else $$render(alternate_2, -1);
						});
					}

					$.reset(p_6);
					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				$.if(node_8, ($$render) => {
					if (contentFilter.isActive && $.get(filteredCount) > 0 && contentFilter.showFilteredCount) $$render(consequent_6);
				});
			}

			var node_10 = $.sibling(node_8, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_8 = root_8();
					var p_7 = $.child(div_8);
					var text_13 = $.only_child(p_7, true);

					$.reset(div_8);

					$.template_effect(($0) => $.set_text(text_13, $0), [
						() => s("stories.fewStories") || "There were no other significant news today, come back tomorrow!"
					]);

					$.append($$anchor, div_8);
				};

				$.if(node_10, ($$render) => {
					if ($.get(displayedStories).length > 0 && $.get(displayedStories).length <= 3) $$render(consequent_7);
				});
			}

			var node_11 = $.sibling(node_10, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_9 = root_9();
					var button_3 = $.child(div_9);
					var text_14 = $.only_child(button_3, true);

					$.reset(div_9);

					$.template_effect(
						($0) => {
							$.set_attribute(button_3, 'aria-label', `Mark all ${$.get(displayedStories).length ?? ''} stories in ${$$props.currentCategory ?? ''} as read`);
							$.set_text(text_14, $0);
						},
						[() => s("article.markAllAsRead") || "Mark all as read"]
					);

					$.delegated('click', button_3, markAllAsRead);
					$.append($$anchor, div_9);
				};

				$.if(node_11, ($$render) => {
					if (!$.get(allStoriesRead) && $.get(displayedStories).length > 0) $$render(consequent_8);
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if ($.get(displayedStories).length === 0) $$render(consequent_3); else $$render(alternate_3, -1);
		});
	}

	$.reset(div);

	var node_12 = $.sibling(div, 2);

	ClusteringExplainerModal(node_12, {
		get visible() {
			return $.get(showClusteringModal);
		},
		onClose: () => $.set(showClusteringModal, false)
	});

	$.append($$anchor, fragment);

	return $.pop($$exports);
}

$.delegate(['click']);