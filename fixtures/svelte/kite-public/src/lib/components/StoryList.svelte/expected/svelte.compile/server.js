import * as $ from 'svelte/internal/server';
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

export default function StoryList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		// Date slug with sequence number for share URLs
		// For new URL format
		// Show category labels for single page mode
		// Skip story count limit (for single page mode)
		let {
			stories = [],
			currentCategory,
			categoryUuid,
			batchId,
			batchDateSlug = null,
			readStories = {},
			expandedStories = {},
			onStoryToggle,
			showSourceOverlay = false,
			currentSource = null,
			sourceArticles = [],
			currentMediaInfo = null,
			isLoadingMediaInfo = false,
			storyCountOverride = null,
			isSharedView = false,
			sharedArticleIndex = null,
			sharedClusterId = null,
			initiallyExpandedIndex = null,
			showCategoryLabels = false,
			skipStoryCountLimit = false
		} = $$props;

		// Modal state
		let showClusteringModal = false;

		// Whether the current category is community (not core)
		const isCommunityCategory = $.derived(() => {
			const metadata = categoryMetadataStore.findById(currentCategory);

			return metadata ? !metadata.isCore : false;
		});

		// Handle story toggle
		function handleStoryToggle(story) {
			// Use UUID as primary identifier for uniqueness across categories
			// Fall back to cluster_number or title for backwards compatibility
			const storyId = story.id || story.cluster_number?.toString() || story.title;

			if (onStoryToggle) {
				onStoryToggle(storyId);
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

			const wasRead = readStories[storyId] || false;
			const isNowRead = !wasRead;

			// Optimistic UI update - show immediately for instant feedback
			if (isNowRead) {
				readStories[storyId] = true;
			} else {
				delete readStories[storyId];
			}

			readStories = { ...readStories }; // Trigger reactivity

			// Persist to database in background
			if (isNowRead) {
				if (story.id) {
					await kiteDB.markStoryAsRead(story.id, story.title, batchId, categoryUuid);
				}
			} else {
				if (story.id) {
					await kiteDB.unmarkStoryAsRead(story.id, batchId, categoryUuid);
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
			displayedStories().forEach(async (story) => {
				if (!story.id) return; // Skip if no UUID

				const storyId = story.id; // Use UUID directly

				readStories[storyId] = true;

				// Persist to database
				if (story.id) {
					// Only mark if we have a UUID
					await kiteDB.markStoryAsRead(
						story.id, // cluster UUID
						story.title,
						batchId,
						categoryUuid
					);
				}
			});
		}

		// Expand or collapse all stories
		function toggleExpandAll() {
			const expand = !allStoriesExpanded();

			// When collapsing, this is simple - just collapse all
			if (!expand) {
				expandedStories = {};

				return;
			}

			// Expand all at once
			const newExpanded = { ...expandedStories };

			displayedStories().forEach((story) => {
				const id = story.id || story.cluster_number?.toString() || story.title;

				newExpanded[id] = true;
			});

			expandedStories = newExpanded;
		}

		// Toggle read status by index (for keyboard navigation)
		function toggleReadStatus(index) {
			const story = displayedStories()[index];

			if (story) {
				handleReadToggle(story);
			}
		}

		// Apply content filtering and story count limit
		const $$d = $.derived(() => {
				// If in shared view mode, only show the specific shared article
				if (isSharedView) {
					let sharedStory;

					console.log('🔍 [StoryList] Shared view mode - finding story:', {
						sharedArticleIndex,
						sharedClusterId,
						storiesCount: stories.length,
						expandedStories,
						firstStory: stories[0]?.title,
						firstCluster: stories[0]?.cluster_number
					});

					// First try to find by UUID from expandedStories (most reliable)
					const expandedStoryId = Object.keys(expandedStories).find((id) => expandedStories[id]);

					if (expandedStoryId) {
						sharedStory = stories.find((s) => s.id === expandedStoryId || s.cluster_number?.toString() === expandedStoryId || s.title === expandedStoryId);
						console.log('🔍 [StoryList] Found by expandedStoryId:', expandedStoryId, '->', sharedStory?.title);
					} else // Fall back to index (legacy format)
					if (sharedArticleIndex !== null && stories[sharedArticleIndex]) {
						sharedStory = stories[sharedArticleIndex];
						console.log('🔍 [StoryList] Found by index:', sharedStory?.title);
					} else // Fall back to clusterId (old format, unreliable in single page mode)
					if (sharedClusterId !== null) {
						sharedStory = stories.find((s) => s.cluster_number === sharedClusterId);
						console.log('🔍 [StoryList] Found by clusterId:', sharedClusterId, '->', sharedStory?.title);
					}

					if (sharedStory) {
						console.log('✅ [StoryList] Showing shared story:', sharedStory.title);

						return {
							displayedStories: [sharedStory],
							filteredCount: 0,
							hiddenStories: stories.filter((s) => s !== sharedStory)
						};
					} else {
						console.warn('❌ [StoryList] Shared story not found!');
					}
				}

				// First apply story count limit
				// In single page mode, stories are already limited per category in orderStoriesForSinglePage
				// So we skip the limit here to show all stories from all categories
				// Use override if provided (e.g., from URL navigation), otherwise use user setting
				const effectiveLimit = storyCountOverride ?? displaySettings.storyCount;

				const limitedStories = skipStoryCountLimit ? stories : stories.slice(0, effectiveLimit);

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
			displayedStories = $.derived(() => $$d().displayedStories),
			filteredCount = $.derived(() => $$d().filteredCount),
			hiddenStories = $.derived(() => $$d().hiddenStories);

		// Check if all stories are read
		const allStoriesRead = $.derived(() => displayedStories().every((story) => story.id && readStories[story.id]));

		// Check if all stories are expanded
		const allStoriesExpanded = $.derived(() => displayedStories().length > 0 && displayedStories().every((story) => expandedStories[story.cluster_number?.toString() || story.title]));

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="story-list">`);

			if (displayedStories().length === 0) {
				$$renderer.push(`<!--[0--><div class="py-8 text-center text-gray-500 dark:text-gray-400">`);

				if (contentFilter.isActive && filteredCount() > 0 && contentFilter.filterMode === "hide") {
					$$renderer.push(`<!--[0--><p class="text-base font-medium mb-2">${$.escape(s("contentFilter.allStoriesFiltered") || "All stories in this category were filtered")}</p> <p class="text-sm mb-4">${$.escape(s("contentFilter.allStoriesFilteredDescription") || "Your content filters have hidden all stories in this category for today.")}</p> <div class="flex flex-col sm:flex-row gap-2 justify-center"><button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">${$.escape(s("contentFilter.adjustFilters") || "Adjust filters")}</button> <button class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">${$.escape(s("contentFilter.disableCategory") || "Disable category")}</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');

					if (timeTravelBatch.isHistoricalBatch) {
						$$renderer.push(`<!--[0--><p>${$.escape(s("stories.noStoriesHistorical") || "This category had no news on this date.")}</p>`);
					} else if (isCommunityCategory()) {
						$$renderer.push(`<!--[1--><div class="max-w-md mx-auto"><p class="text-base font-medium mb-2">${$.escape(s("stories.noStoriesCommunity") || "No stories for this community category today.")}</p> <p class="text-sm mb-4">${$.escape(s("stories.noStoriesCommunityDescription") || "Not enough shared news between feeds to form stories. This happens sometimes with community categories.")}</p> <button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 inline-flex items-center gap-1.5">`);
						IconInfoCircle($$renderer, { size: 16 });
						$$renderer.push(`<!----> ${$.escape(s("stories.noStoriesCommunityLearnMore") || "Learn how it works")}</button></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="max-w-md mx-auto"><div class="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-3">`);
						IconClock($$renderer, { size: 20 });
						$$renderer.push(`<!----> <span class="text-sm font-medium">${$.escape(s("stories.noStoriesCoreUpdates") || "Temporarily unavailable")}</span></div> <p class="text-base">${$.escape(s("stories.noStoriesCore") || "Stories for this category should be available soon. Check back in a bit.")}</p></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push(`<!--[-1--><!--[-->`);

				const each_array = $.ensure_array_like(displayedStories());

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let story = each_array[index];
					const isFiltered = contentFilter.filterMode === "blur" && story._filtered;
					const isLinkedStory = initiallyExpandedIndex === index;
					const isKeyboardSelected = keyboardNavigation.selectedIndex === index;
					const storyWithCategory = story;
					const categoryId = storyWithCategory._categoryId || currentCategory;
					const categoryName = storyWithCategory._categoryName;
					const prevStoryWithCategory = index > 0 ? displayedStories()[index - 1] : null;
					const showCategoryHeader = showCategoryLabels && !isSharedView && categoryName && (index === 0 || categoryId !== prevStoryWithCategory?._categoryId);

					if (showCategoryHeader) {
						$$renderer.push(`<!--[0--><div class="mb-4 mt-8 first:mt-0 category-section-header"${$.attr('data-category-id', categoryId)}><h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b-2 border-gray-300 dark:border-gray-600 pb-2">${$.escape(categoryName)}</h2></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					StoryCard($$renderer, {
						story,
						storyIndex: index,
						batchId,
						batchDateSlug,
						categoryId,
						isRead: story.id && readStories[story.id] || false,
						isExpanded: expandedStories[story.id || story.cluster_number?.toString() || story.title] || false,
						shouldAutoScroll: !allStoriesExpanded(),
						onToggle: () => handleStoryToggle(story),
						onReadToggle: () => handleReadToggle(story),
						priority: index < 3,
						isFiltered,
						filterKeywords: story._matchedKeywords,
						isSharedView,
						isLinkedStory,
						isKeyboardSelected,
						get showSourceOverlay() {
							return showSourceOverlay;
						},

						set showSourceOverlay($$value) {
							showSourceOverlay = $$value;
							$$settled = false;
						},

						get currentSource() {
							return currentSource;
						},

						set currentSource($$value) {
							currentSource = $$value;
							$$settled = false;
						},

						get sourceArticles() {
							return sourceArticles;
						},

						set sourceArticles($$value) {
							sourceArticles = $$value;
							$$settled = false;
						},

						get currentMediaInfo() {
							return currentMediaInfo;
						},

						set currentMediaInfo($$value) {
							currentMediaInfo = $$value;
							$$settled = false;
						},

						get isLoadingMediaInfo() {
							return isLoadingMediaInfo;
						},

						set isLoadingMediaInfo($$value) {
							isLoadingMediaInfo = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--> `);

				if (contentFilter.isActive && filteredCount() > 0 && contentFilter.showFilteredCount) {
					$$renderer.push(`<!--[0--><div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"><p>`);

					if (contentFilter.filterMode === "hide") {
						$$renderer.push(`<!--[0-->${$.escape(filteredCount() === 1
							? s("contentFilter.storyHidden", { count: filteredCount().toString() })
							: s("contentFilter.storiesHidden", { count: filteredCount().toString() }))}`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(filteredCount() === 1
							? s("contentFilter.storyFiltered", { count: filteredCount().toString() })
							: s("contentFilter.storiesFiltered", { count: filteredCount().toString() }))}`);
					}

					$$renderer.push(`<!--]--></p></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (displayedStories().length > 0 && displayedStories().length <= 3) {
					$$renderer.push(`<!--[0--><div class="mt-6 py-4 text-center text-gray-600 dark:text-gray-400"><p class="text-base">${$.escape(s("stories.fewStories") || "There were no other significant news today, come back tomorrow!")}</p></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (!allStoriesRead() && displayedStories().length > 0) {
					$$renderer.push(`<!--[0--><div class="mt-6 w-full text-center"><button${$.attr('aria-label', `Mark all ${$.stringify(displayedStories().length)} stories in ${$.stringify(currentCategory)} as read`)} class="w-full rounded-lg bg-gray-100 px-6 py-3 text-gray-800 transition-colors duration-200 hover:bg-gray-200 md:w-auto dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">${$.escape(s("article.markAllAsRead") || "Mark all as read")}</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div> `);

			ClusteringExplainerModal($$renderer, {
				visible: showClusteringModal,
				onClose: () => showClusteringModal = false
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		$.bind_props($$props, {
			readStories,
			expandedStories,
			showSourceOverlay,
			currentSource,
			sourceArticles,
			currentMediaInfo,
			isLoadingMediaInfo,
			toggleExpandAll,
			toggleReadStatus
		});
	});
}