import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import { goto, replaceState } from '$app/navigation';
import { page } from '$app/state';
import { categorySettings, displaySettings, languageSettings } from '$lib/data/settings.svelte.js';
import { dataService } from '$lib/services/dataService';
import { UrlNavigationService } from '$lib/services/urlNavigationService';

export default function HistoryManager($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Array of stories for finding story by index
		// Make this a bindable prop
		let {
			batchId = void 0,
			dateSlug = null,
			batchCreatedAt = null,
			categoryId = void 0,
			storyIndex = null,
			stories = [],
			isLatestBatch = false,
			isSharedView = false, // Bind to parent state
			onNavigate
		} = $$props;

		// Track the last URL we've fully processed
		let lastProcessedUrl = '';

		// Build URL based on current state
		// Language settings are stored in localStorage, not in URL
		function buildUrl(params) {
			// Determine which batch identifier to use: dateSlug (if available) or UUID
			let batchIdentifier = params?.batchId !== undefined ? params.batchId : batchId;

			// Prefer date slug over UUID when available and not using /latest prefix
			if (dateSlug && !displaySettings.useLatestUrls) {
				batchIdentifier = dateSlug;
			}

			const targetStoryIndex = params?.storyIndex !== undefined ? params.storyIndex : storyIndex;

			// Get story data if we have a story index
			let story = null;

			if (targetStoryIndex !== null && targetStoryIndex !== undefined && stories.length > 0) {
				story = stories[targetStoryIndex];

				console.log('🔍 [HistoryManager] Looking up story:', {
					targetStoryIndex,
					storiesLength: stories.length,
					foundStory: story?.title,
					clusterId: story?.cluster_number
				});
			}

			// In single page mode with no story on latest batch, don't include category in URL
			// But for historical batches or sequential mode, always include category
			const effectiveCategoryId = params?.categoryId !== undefined ? params.categoryId : categoryId;

			const isSinglePageMode = categorySettings.singlePageMode !== 'disabled';
			const isSequentialMode = categorySettings.singlePageMode === 'sequential';
			const shouldIncludeCategory = story !== null || !isSinglePageMode || !isLatestBatch || isSequentialMode;

			const navigationParams = {
				batchId: batchIdentifier,
				batchDateSlug: dateSlug || undefined,
				categoryId: shouldIncludeCategory ? effectiveCategoryId : undefined,
				storyIndex: targetStoryIndex,
				// Include story data for new URL format
				clusterId: story?.cluster_number,
				storyTitle: story?.title,
				// Preserve shared view state
				isShared: params?.isShared !== undefined ? params.isShared : isSharedView
			};

			// Use /latest URLs for the actual latest batch
			// isLatestBatch already indicates whether we're on the latest batch or not
			const useLatestPrefix = isLatestBatch;

			return UrlNavigationService.buildUrl(
				navigationParams,
				undefined, // No language in URL
				useLatestPrefix,
				batchCreatedAt
			);
		}

		// Preserve overlay query params (e.g. ?view=chaos) that live outside the navigation model
		function preserveOverlayParams(newUrl) {
			const viewParam = new URL(window.location.href).searchParams.get('view');

			if (viewParam) {
				const separator = newUrl.includes('?') ? '&' : '?';

				return `${newUrl}${separator}view=${viewParam}`;
			}

			return newUrl;
		}

		// Update URL without triggering navigation
		function updateUrl(params) {
			if (!browser) return;

			// Update isSharedView immediately if provided in params
			if (params?.isShared !== undefined) {
				isSharedView = params.isShared;
			}

			const newUrl = preserveOverlayParams(buildUrl(params));
			const currentUrl = UrlNavigationService.getFullUrl(page.url);

			// Only update if URL actually changed
			if (newUrl !== currentUrl) {
				// DON'T update lastProcessedUrl here - let the effect handle it
				replaceState(newUrl, {});
			}
		}

		// Navigate to new URL with history entry
		function navigateTo(params) {
			if (!browser) return;

			const newUrl = preserveOverlayParams(buildUrl(params));

			// Only navigate if URL actually changed
			if (newUrl !== lastProcessedUrl) {
				lastProcessedUrl = newUrl;
				goto(newUrl);
			}
		}

		// Track if initial load has been processed
		let initialLoadProcessed = false;

		// Handle initial page load and browser navigation
		// Build what we EXPECT the URL to be based on current state
		// If the page URL matches what we expect, we're in sync - nothing to do
		// This is a real navigation (from browser back/forward or external)
		// Parse the URL
		// Update shared view state from URL
		// If shared=1 but no story, clean it from URL
		// Don't call onNavigate for this cleanup
		// Handle initial load
		// Notify parent component about navigation
		// Track previous props to detect actual changes
		let previousBatchId = void 0;

		let previousCategoryId = void 0;
		let previousStoryIndex = void 0;
		let previousIsLatestBatch = void 0;

		// Track previous values including stories count for format normalization
		let previousStoriesCount = 0;

		$.bind_props($$props, {
			batchId,
			dateSlug,
			batchCreatedAt,
			categoryId,
			storyIndex,
			isSharedView,
			updateUrl,
			navigateTo
		});
		// Update URL when props change (but only call updateUrl, which is idempotent)
		// Only update URL if props actually changed
		// Don't update URL on initial stories load if we already have a story in the URL
		// This prevents overwriting article URLs with category URLs when loading from a direct link
		// Use != null (loose equality) to catch both null and undefined
		// Don't update URL - keep the original story URL or shared view state
		// Update URL to reflect current state
		// updateUrl() is idempotent - it won't do anything if the URL is already correct
	});
}