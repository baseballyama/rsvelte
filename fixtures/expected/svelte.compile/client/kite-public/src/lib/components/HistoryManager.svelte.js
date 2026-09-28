import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { goto, replaceState } from '$app/navigation';
import { page } from '$app/state';
import { categorySettings, displaySettings, languageSettings } from '$lib/data/settings.svelte.js';
import { dataService } from '$lib/services/dataService';
import { UrlNavigationService } from '$lib/services/urlNavigationService';

export default function HistoryManager($$anchor, $$props) {
	$.push($$props, true);

	// Array of stories for finding story by index
	// Make this a bindable prop
	let dateSlug = $.prop($$props, 'dateSlug', 11, null),
		batchCreatedAt = $.prop($$props, 'batchCreatedAt', 11, null),
		storyIndex = $.prop($$props, 'storyIndex', 11, null),
		stories = $.prop($$props, 'stories', 19, () => []),
		isLatestBatch = $.prop($$props, 'isLatestBatch', 3, false),
		isSharedView = $.prop($$props, 'isSharedView', 15, false // Bind to parent state
		);

	// Track the last URL we've fully processed
	let lastProcessedUrl = $.state('');

	// Build URL based on current state
	// Language settings are stored in localStorage, not in URL
	function buildUrl(params) {
		// Determine which batch identifier to use: dateSlug (if available) or UUID
		let batchIdentifier = params?.batchId !== undefined ? params.batchId : $$props.batchId;

		// Prefer date slug over UUID when available and not using /latest prefix
		if (dateSlug() && !displaySettings.useLatestUrls) {
			batchIdentifier = dateSlug();
		}

		const targetStoryIndex = params?.storyIndex !== undefined ? params.storyIndex : storyIndex();

		// Get story data if we have a story index
		let story = null;

		if (targetStoryIndex !== null && targetStoryIndex !== undefined && stories().length > 0) {
			story = stories()[targetStoryIndex];

			console.log('🔍 [HistoryManager] Looking up story:', {
				targetStoryIndex,
				storiesLength: stories().length,
				foundStory: story?.title,
				clusterId: story?.cluster_number
			});
		}

		// In single page mode with no story on latest batch, don't include category in URL
		// But for historical batches or sequential mode, always include category
		const effectiveCategoryId = params?.categoryId !== undefined ? params.categoryId : $$props.categoryId;

		const isSinglePageMode = categorySettings.singlePageMode !== 'disabled';
		const isSequentialMode = categorySettings.singlePageMode === 'sequential';
		const shouldIncludeCategory = story !== null || !isSinglePageMode || !isLatestBatch() || isSequentialMode;

		const navigationParams = {
			batchId: batchIdentifier,
			batchDateSlug: dateSlug() || undefined,
			categoryId: shouldIncludeCategory ? effectiveCategoryId : undefined,
			storyIndex: targetStoryIndex,
			// Include story data for new URL format
			clusterId: story?.cluster_number,
			storyTitle: story?.title,
			// Preserve shared view state
			isShared: params?.isShared !== undefined ? params.isShared : isSharedView()
		};

		// Use /latest URLs for the actual latest batch
		// isLatestBatch already indicates whether we're on the latest batch or not
		const useLatestPrefix = isLatestBatch();

		return UrlNavigationService.buildUrl(
			navigationParams,
			undefined, // No language in URL
			useLatestPrefix,
			batchCreatedAt()
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
			isSharedView(params.isShared);
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
		if (newUrl !== $.get(lastProcessedUrl)) {
			$.set(lastProcessedUrl, newUrl, true);
			goto(newUrl);
		}
	}

	// Track if initial load has been processed
	let initialLoadProcessed = $.state(false);

	// Handle initial page load and browser navigation
	$.user_effect(() => {
		if (!browser) return;

		const urlString = UrlNavigationService.getFullUrl(page.url);

		// Build what we EXPECT the URL to be based on current state
		const expectedUrl = buildUrl();

		// If the page URL matches what we expect, we're in sync - nothing to do
		if (urlString === expectedUrl || urlString === $.get(lastProcessedUrl)) {
			return;
		}

		// This is a real navigation (from browser back/forward or external)
		$.set(lastProcessedUrl, urlString, true);

		// Parse the URL
		const params = UrlNavigationService.parseUrl(page.url);

		// Update shared view state from URL
		const hasStory = params.storyIndex !== null && params.storyIndex !== undefined || params.clusterId !== null && params.clusterId !== undefined;

		if (params.isShared && hasStory) {
			isSharedView(true);
		} else if (params.isShared && !hasStory) {
			// If shared=1 but no story, clean it from URL
			isSharedView(false);

			const cleanUrl = new URL(page.url);

			cleanUrl.searchParams.delete('shared');

			const cleanedUrlString = cleanUrl.pathname + cleanUrl.search;

			$.set(lastProcessedUrl, cleanedUrlString);
			replaceState(cleanedUrlString, {});

			return; // Don't call onNavigate for this cleanup
		} else {
			isSharedView(false);
		}

		// Handle initial load
		if (!$.get(initialLoadProcessed)) {
			$.set(initialLoadProcessed, true);
		}

		// Notify parent component about navigation
		const hasParams = params.batchId !== undefined || params.categoryId !== undefined || params.storyIndex !== undefined || params.clusterId !== undefined || params.dataLang !== undefined || params.isShared !== undefined;

		if (hasParams && $$props.onNavigate) {
			$$props.onNavigate(params);
		}
	});

	// Track previous props to detect actual changes
	let previousBatchId = $.state(void 0);

	let previousCategoryId = $.state(void 0);
	let previousStoryIndex = $.state(void 0);
	let previousIsLatestBatch = $.state(void 0);

	// Track previous values including stories count for format normalization
	let previousStoriesCount = $.state(0);

	// Update URL when props change (but only call updateUrl, which is idempotent)
	$.user_effect(() => {
		if (!browser || !$.get(initialLoadProcessed)) return;

		// Only update URL if props actually changed
		const batchChanged = $$props.batchId !== $.get(previousBatchId);

		const categoryChanged = $$props.categoryId !== $.get(previousCategoryId);
		const storyChanged = storyIndex() !== $.get(previousStoryIndex);
		const latestBatchChanged = isLatestBatch() !== $.get(previousIsLatestBatch);
		const storiesLoaded = stories().length > 0 && $.get(previousStoriesCount) === 0;

		if (batchChanged || categoryChanged || storyChanged || latestBatchChanged || storiesLoaded) {
			$.set(previousBatchId, $$props.batchId, true);
			$.set(previousCategoryId, $$props.categoryId, true);
			$.set(previousStoryIndex, storyIndex());
			$.set(previousIsLatestBatch, isLatestBatch());
			$.set(previousStoriesCount, stories().length, true);

			// Don't update URL on initial stories load if we already have a story in the URL
			// This prevents overwriting article URLs with category URLs when loading from a direct link
			if (storiesLoaded && !storyChanged && !batchChanged && !categoryChanged) {
				const parsedUrl = UrlNavigationService.parseUrl(page.url);

				// Use != null (loose equality) to catch both null and undefined
				const hasStoryInUrl = parsedUrl.storyIndex != null || parsedUrl.clusterId != null;

				if (hasStoryInUrl || isSharedView()) {
					// Don't update URL - keep the original story URL or shared view state
					return;
				}
			}

			// Update URL to reflect current state
			// updateUrl() is idempotent - it won't do anything if the URL is already correct
			updateUrl();
		}
	});

	var $$exports = { updateUrl, navigateTo };

	return $.pop($$exports);
}