import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { dev } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { categorySettings, languageSettings, sectionSettings } from '$lib/data/settings.svelte.js';
import { dataReloadService, dataService } from '$lib/services/dataService';
import { imagePreloadingService } from '$lib/services/imagePreloadingService.js';
import { timeTravel } from '$lib/stores/timeTravel.svelte.js';
import { timeTravelBatch } from '$lib/stores/timeTravelBatch.svelte.js';
import { isMobileDevice } from '$lib/utils/device';
import { formatTimeAgo } from '$lib/utils/formatTimeAgo';
import SplashScreen from './SplashScreen.svelte';

export default function DataLoader($$anchor, $$props) {
	$.push($$props, true);

	// Props
	// Loading state
	let initialLoading = $.state(true);

	let loadingProgress = $.state(0);
	let loadingStage = $.state('');
	let hasError = $.state(false);
	let errorMessage = $.state('');

	// Data state
	let categories = $.state($.proxy([]));

	let stories = $.state($.proxy([]));
	let totalReadCount = $.state(0);
	let lastUpdated = $.state('');
	let currentCategory = $.state('');
	let allCategoryStories = $.state($.proxy({}));
	let isLatestBatch = $.state(true);

	// Initialize loading stage
	$.user_effect(() => {
		if ($.get(initialLoading) && !$.get(loadingStage)) {
			$.set(loadingStage, s('loading.initializing') || 'Initializing...', true);
		}
	});

	// Function to preload all images for stories
	async function preloadCategoryImages(stories) {
		// Skip preloading in dev mode
		if (dev) return;

		await imagePreloadingService.preloadCategory(stories);
	}

	/**
	 * Select which categories to preload based on device, mode, and a max cap.
	 * Returns the target + adjacent categories from the ordered list, up to the cap.
	 */
	const MAX_PRELOAD_CATEGORIES = 6;

	function selectCategoriesToPreload(allCategories, targetCategory, opts) {
		if (opts.isSinglePageMode) return allCategories;
		if (dev || opts.isMobile || opts.isTimeTravel) return [targetCategory];
		if (allCategories.length <= MAX_PRELOAD_CATEGORIES) return allCategories;

		const targetIndex = allCategories.indexOf(targetCategory);

		if (targetIndex === -1) {
			// Target not in list (e.g. onthisday) — just take the first N
			return allCategories.slice(0, MAX_PRELOAD_CATEGORIES);
		}

		const half = Math.floor((MAX_PRELOAD_CATEGORIES - 1) / 2);
		let start = targetIndex - half;
		let end = targetIndex + half + 1;

		if (start < 0) {
			end = Math.min(allCategories.length, end - start);
			start = 0;
		} else if (end > allCategories.length) {
			start = Math.max(0, start - (end - allCategories.length));
			end = allCategories.length;
		}

		const selected = allCategories.slice(start, end);

		if (!selected.includes(targetCategory)) {
			selected.unshift(targetCategory);

			return selected.slice(0, MAX_PRELOAD_CATEGORIES);
		}

		return selected;
	}

	// Main data loading function
	async function loadInitialData() {
		try {
			$.set(loadingStage, '...');
			$.set(loadingProgress, 10);

			// Store batch info to avoid duplicate API calls
			let providedBatchInfo;

			// Check if we have a batch ID from URL
			if ($$props.initialBatchId) {
				// First, get the latest batch to compare
				const lang = languageSettings.getLanguageForAPI();

				const latestResponse = await fetch(`/api/batches/latest?lang=${lang}`);

				if (latestResponse.ok) {
					const latestBatch = await latestResponse.json();

					// Only set time travel mode if this is NOT the latest batch
					// Support both UUID format and date slug format for backwards compatibility
					const isLatest = $$props.initialBatchId === latestBatch.id || $$props.initialBatchId === latestBatch.dateSlug;

					if (!isLatest) {
						console.log('🎯 Setting time travel mode for historical batch:', $$props.initialBatchId);
						$.set(isLatestBatch, false);

						// Also set the time travel UI state so the banner shows
						// We need to get the batch info to set the correct date
						try {
							const batchResponse = await fetch(`/api/batches/${$$props.initialBatchId}`);

							if (batchResponse.ok) {
								const batchData = await batchResponse.json();
								const batchDate = new Date(batchData.createdAt);

								console.log('🎯 Setting time travel UI state for date:', batchDate);
								timeTravel.selectDate(batchDate);
								timeTravel.selectBatch($$props.initialBatchId);

								// Set time travel batch with createdAt for URL generation (historical = true)
								timeTravelBatch.set($$props.initialBatchId, batchData.createdAt, batchData.dateSlug, true, 'url');

								// Store the batch info to pass to batchService
								providedBatchInfo = {
									id: batchData.id,
									createdAt: batchData.createdAt,
									dateSlug: batchData.dateSlug,
									totalReadCount: batchData.totalReadCount
								};
							}
						} catch(error) {
							console.warn('Failed to get batch info for time travel UI:', error);
						}
					} else {
						console.log('🎯 Batch from URL is the latest batch, not setting time travel mode');
						$.set(isLatestBatch, true);

						// Store the latest batch info to avoid duplicate fetch
						providedBatchInfo = {
							id: latestBatch.id,
							createdAt: latestBatch.createdAt,
							dateSlug: latestBatch.dateSlug,
							totalReadCount: latestBatch.totalReadCount
						};
					}
				}
			} else {
				// No batch ID in URL means we're viewing the latest
				$.set(isLatestBatch, true);
			}

			// Load initial data (batch info + categories) - pass batch info if we have it
			const initialData = await dataService.loadInitialData(languageSettings.getLanguageForAPI(), providedBatchInfo);

			console.log('📥 DataLoader received initialData:', initialData);
			console.log('📥 Categories from initialData:', initialData.categories?.length || 0);
			$.set(categories, initialData.categories, true);

			const {
				batchId,
				dateSlug,
				batchCreatedAt,
				categoryMap,
				chaosIndex,
				chaosDescription,
				chaosLastUpdated,
				timestamp: batchTimestamp
			} = initialData;

			$.set(totalReadCount, initialData.totalReadCount, true);

			// Get available category IDs
			const availableCategoryIds = $.get(categories).map((cat) => cat.id);

			// Declare validEnabledCategories outside the block
			let validEnabledCategories;

			// Only update categories if we actually received some from the API
			if ($.get(categories).length > 0) {
				// Initialize categories store with loaded data
				categorySettings.setAllCategories($.get(categories));

				console.log('📊 Before init, enabled:', $.snapshot(categorySettings.enabled));
				categorySettings.init();
				console.log('📊 After init, enabled:', $.snapshot(categorySettings.enabled));
				categorySettings.initWithDefaults();
				console.log('📊 After initWithDefaults, enabled:', $.snapshot(categorySettings.enabled));

				// Keep all enabled categories (even if not in current batch - they'll show "no stories" message)
				// But clean up disabled categories that no longer exist
				validEnabledCategories = categorySettings.enabled;

				console.log('📊 Keeping all enabled categories:', validEnabledCategories);

				// Clean up disabled categories that don't exist in current batch
				const validDisabledCategories = categorySettings.disabled.filter((catId) => availableCategoryIds.includes(catId));

				if (validDisabledCategories.length !== categorySettings.disabled.length) {
					console.log('Cleaning up disabled categories not in current batch');
					categorySettings.cleanupDisabled(validDisabledCategories);
				}
			} else {
				console.warn('No categories received from API, keeping existing settings');

				// Still initialize with defaults if we have no settings at all
				if (categorySettings.enabled.length === 0) {
					categorySettings.initWithDefaults();
				}

				validEnabledCategories = categorySettings.enabled;
			}

			console.log('📊 Valid enabled categories for loading:', $.snapshot(validEnabledCategories));

			// Initialize sections store
			sectionSettings.init();

			$.set(loadingStage, s('loading.stories') || 'Loading all category stories...', true);
			$.set(loadingProgress, 30);

			// Get all enabled categories except OnThisDay (case-insensitive) for loading
			// Use validEnabledCategories to ensure we only try to load existing categories
			const enabledCategoriesForLoading = validEnabledCategories.filter((cat) => cat.toLowerCase() !== 'onthisday');

			// If we have a category from URL that's not enabled, we need to include it
			let categoriesToLoad = [...enabledCategoriesForLoading];

			let temporaryCategoryId = null;

			// Check against ALL enabled categories (including OnThisDay) to determine if it's temporary
			if ($$props.initialCategoryId && !validEnabledCategories.includes($$props.initialCategoryId)) {
				// Check if this category exists in the available categories
				if (availableCategoryIds.includes($$props.initialCategoryId)) {
					categoriesToLoad.push($$props.initialCategoryId);
					temporaryCategoryId = $$props.initialCategoryId;

					// Temporarily add to enabled categories so it shows in the navigation
					categorySettings.addTemporary($$props.initialCategoryId);
				}

				// Category doesn't exist - will fallback to first enabled category below
			}

			// Use category from URL if provided, otherwise use first enabled
			const targetCategory = $$props.initialCategoryId || enabledCategoriesForLoading[0] || 'World';

			$.set(currentCategory, targetCategory, true);

			const isMobile = isMobileDevice();
			const isInSinglePageMode = categorySettings.singlePageMode !== 'disabled';
			const categoriesToActuallyLoad = selectCategoriesToPreload(categoriesToLoad, targetCategory, { isMobile, isSinglePageMode: isInSinglePageMode });

			if (categoriesToActuallyLoad.length < categoriesToLoad.length) {
				console.log(`🖥️ Preloading ${categoriesToActuallyLoad.length}/${categoriesToLoad.length} categories (capped at ${MAX_PRELOAD_CATEGORIES})`);
			}

			// Load stories for categories (only first on mobile, all on desktop)
			const categoryPromises = categoriesToActuallyLoad.map(async (categoryId) => {
				try {
					const categoryUuid = categoryMap[categoryId];

					if (!categoryUuid) {
						console.warn(`Category UUID not found for ${categoryId}`);

						return {
							categoryId,
							stories: [],
							readCount: 0,
							timestamp: Date.now() / 1000
						};
					}

					const result = await dataService.loadStories(batchId, categoryUuid, 12, languageSettings.getLanguageForAPI());

					return {
						categoryId,
						stories: result.stories,
						readCount: result.readCount,
						timestamp: result.timestamp
					};
				} catch(error) {
					console.warn(`Failed to load stories for category ${categoryId}:`, error);

					return {
						categoryId,
						stories: [],
						readCount: 0,
						timestamp: Date.now() / 1000
					};
				}
			});

			const categoryResults = await Promise.all(categoryPromises);

			// Store all category stories
			$.set(allCategoryStories, {}, true);

			let maxTimestamp = 0;
			let totalReadCountSum = 0;

			categoryResults.forEach((result) => {
				$.get(allCategoryStories)[result.categoryId] = result.stories;
				maxTimestamp = Math.max(maxTimestamp, result.timestamp);
				totalReadCountSum += result.readCount;
			});

			// Set initial display to target category (from URL or first enabled)
			$.set(stories, $.get(allCategoryStories)[targetCategory] || [], true);

			// Use batch totalReadCount if available, otherwise fall back to sum
			if (!$.get(totalReadCount) || $.get(totalReadCount) === 0) {
				$.set(totalReadCount, totalReadCountSum, true);
			}

			// Use batch timestamp for "Updated X ago" display (more accurate than category timestamps)
			$.set(lastUpdated, formatTimeAgo(batchTimestamp, s), true);

			// Image preloading is now handled by the service which checks time travel mode internally
			$.set(loadingStage, s('loading.images') || 'Preloading first category images...', true);

			$.set(loadingProgress, 50);

			// Only preload images for the first category to keep initial load fast
			const firstCategoryStories = $.get(allCategoryStories)[targetCategory] || [];

			console.log(`📦 Preloading images for first category: ${targetCategory} (${firstCategoryStories.length} stories)`);
			console.log(`📚 Total categories loaded: ${Object.keys($.get(allCategoryStories)).length} (${Object.values($.get(allCategoryStories)).flat().length} total stories)`);

			if (firstCategoryStories.length > 0) {
				await preloadCategoryImages(firstCategoryStories);
			}

			$.set(loadingStage, s('loading.finishing') || 'Finishing up...', true);
			$.set(loadingProgress, 90);
			await new Promise((resolve) => setTimeout(resolve, 100));
			$.set(loadingProgress, 100);
			$.set(loadingStage, s('loading.ready') || 'Ready!', true);

			// Shorter wait before hiding splash screen
			setTimeout(
				() => {
					$.set(initialLoading, false);

					// Call the callback with loaded data
					if ($$props.onDataLoaded) {
						$$props.onDataLoaded({
							categories: $.get(categories),
							stories: $.get(stories),
							totalReadCount: $.get(totalReadCount),
							lastUpdated: $.get(lastUpdated),
							lastUpdatedTimestamp: batchTimestamp,
							currentCategory: $.get(currentCategory),
							allCategoryStories: $.get(allCategoryStories // Pass all preloaded stories
							),
							categoryMap,
							batchId,
							dateSlug,
							batchCreatedAt,
							chaosIndex,
							chaosDescription,
							chaosLastUpdated,
							isLatestBatch: $.get(isLatestBatch),
							temporaryCategory: temporaryCategoryId
						});
					}
				},
				150
			);
		} catch(error) {
			console.error('Error loading initial data:', error);
			$.set(hasError, true);
			$.set(errorMessage, error instanceof Error ? error.message : 'Failed to load data', true);
			$.set(loadingStage, s('loading.error') || 'Error loading data', true);

			// Show error for a bit then continue with fallback
			setTimeout(
				() => {
					$.set(initialLoading, false);

					if ($$props.onError) {
						$$props.onError($.get(errorMessage));
					}
				},
				2000
			);
		}
	}

	// Comprehensive reload function for language changes
	async function reloadAllData() {
		try {
			console.log(`🌍 reloadAllData called - Data language changed to ${languageSettings.data}, reloading all data...`);

			// Load initial data (batch info + categories)
			const initialData = await dataService.loadInitialData(languageSettings.getLanguageForAPI());

			$.set(categories, initialData.categories, true);

			const {
				batchId,
				dateSlug,
				batchCreatedAt,
				categoryMap,
				chaosIndex,
				chaosDescription,
				chaosLastUpdated,
				timestamp: batchTimestamp
			} = initialData;

			$.set(totalReadCount, initialData.totalReadCount, true);

			// Set isLatestBatch based on time travel mode
			// If in time travel mode (historical batch), isLatestBatch should be false
			$.set(isLatestBatch, !timeTravelBatch.isTimeTravelMode());

			// Update timeTravelBatch with the dateSlug from API response (important for URL generation)
			if (timeTravelBatch.isTimeTravelMode() && dateSlug) {
				timeTravelBatch.set(batchId, batchCreatedAt, dateSlug, true);
			}

			// Get available category IDs
			const availableCategoryIds = $.get(categories).map((cat) => cat.id);

			// Declare validEnabledCategories outside the block
			let validEnabledCategories;

			// Only update categories if we actually received some from the API
			if ($.get(categories).length > 0) {
				// Update categories store with new data
				categorySettings.setAllCategories($.get(categories));

				// Keep all enabled categories (even if not in current batch - they'll show "no stories" message)
				// But clean up disabled categories that no longer exist
				validEnabledCategories = categorySettings.enabled;

				// Clean up disabled categories that don't exist in current batch
				const validDisabledCategories = categorySettings.disabled.filter((catId) => availableCategoryIds.includes(catId));

				if (validDisabledCategories.length !== categorySettings.disabled.length) {
					console.log('Cleaning up disabled categories not in current batch');
					categorySettings.cleanupDisabled(validDisabledCategories);
				}
			} else {
				console.warn('No categories received from API during language reload, keeping existing settings');
				validEnabledCategories = categorySettings.enabled;
			}

			// Get all enabled categories except OnThisDay (case-insensitive) for loading
			const enabledCategoriesForLoading = validEnabledCategories.filter((cat) => cat.toLowerCase() !== 'onthisday');

			// If we have a category from URL that's not enabled, we need to include it
			let categoriesToLoad = [...enabledCategoriesForLoading];

			let temporaryCategoryId = null;

			// Check against ALL enabled categories (including OnThisDay) to determine if it's temporary
			if ($$props.initialCategoryId && !validEnabledCategories.includes($$props.initialCategoryId)) {
				// Check if this category exists in the available categories
				if (availableCategoryIds.includes($$props.initialCategoryId)) {
					categoriesToLoad.push($$props.initialCategoryId);
					temporaryCategoryId = $$props.initialCategoryId;

					// Temporarily add to enabled categories so it shows in the navigation
					categorySettings.addTemporary($$props.initialCategoryId);
				}

				// Category doesn't exist - will fallback to first enabled category below
			}

			const firstEnabledCategory = $$props.initialCategoryId || enabledCategoriesForLoading[0] || 'World';

			$.set(currentCategory, firstEnabledCategory, true);

			const isMobile = isMobileDevice();
			const isTimeTravel = timeTravelBatch.isHistoricalBatch;
			const isInSinglePageMode = categorySettings.singlePageMode !== 'disabled';
			const categoriesToActuallyLoad = selectCategoriesToPreload(categoriesToLoad, firstEnabledCategory, { isMobile, isTimeTravel, isSinglePageMode: isInSinglePageMode });

			if (categoriesToActuallyLoad.length < categoriesToLoad.length) {
				console.log(`🖥️ Reload - preloading ${categoriesToActuallyLoad.length}/${categoriesToLoad.length} categories (capped at ${MAX_PRELOAD_CATEGORIES})`);
			}

			// Load stories for categories (only first on mobile, all on desktop)
			const categoryPromises = categoriesToActuallyLoad.map(async (categoryId) => {
				try {
					const categoryUuid = categoryMap[categoryId];

					if (!categoryUuid) {
						console.warn(`Category UUID not found for ${categoryId}`);

						return {
							categoryId,
							stories: [],
							readCount: 0,
							timestamp: Date.now() / 1000
						};
					}

					const result = await dataService.loadStories(batchId, categoryUuid, 12, languageSettings.getLanguageForAPI());

					return {
						categoryId,
						stories: result.stories,
						readCount: result.readCount,
						timestamp: result.timestamp
					};
				} catch(error) {
					console.warn(`Failed to load stories for category ${categoryId}:`, error);

					return {
						categoryId,
						stories: [],
						readCount: 0,
						timestamp: Date.now() / 1000
					};
				}
			});

			const categoryResults = await Promise.all(categoryPromises);

			// Store all category stories
			$.set(allCategoryStories, {}, true);

			let maxTimestamp = 0;
			let totalReadCountSum = 0;

			categoryResults.forEach((result) => {
				$.get(allCategoryStories)[result.categoryId] = result.stories;
				maxTimestamp = Math.max(maxTimestamp, result.timestamp);
				totalReadCountSum += result.readCount;
			});

			// Set initial display to current category (from URL or first enabled)
			$.set(stories, $.get(allCategoryStories)[$.get(currentCategory)] || [], true);

			// Use batch totalReadCount if available, otherwise fall back to sum
			if (!$.get(totalReadCount) || $.get(totalReadCount) === 0) {
				$.set(totalReadCount, totalReadCountSum, true);
			}

			// Use batch timestamp for "Updated X ago" display (more accurate than category timestamps)
			$.set(lastUpdated, formatTimeAgo(batchTimestamp, s), true);

			// Preload images for the current category
			const firstCategoryStories = $.get(allCategoryStories)[$.get(currentCategory)] || [];

			if (firstCategoryStories.length > 0) {
				await preloadCategoryImages(firstCategoryStories);
			}

			console.log(`✅ Language reload complete: ${enabledCategoriesForLoading.length} categories, ${Object.values($.get(allCategoryStories)).flat().length} total stories`);

			// Notify parent component with updated data
			if ($$props.onDataLoaded) {
				$$props.onDataLoaded({
					categories: $.get(categories),
					stories: $.get(stories),
					totalReadCount: $.get(totalReadCount),
					lastUpdated: $.get(lastUpdated),
					lastUpdatedTimestamp: batchTimestamp,
					currentCategory: $.get(currentCategory),
					allCategoryStories: $.get(allCategoryStories),
					categoryMap,
					batchId,
					dateSlug,
					batchCreatedAt,
					chaosIndex,
					chaosDescription,
					chaosLastUpdated,
					isLatestBatch: $.get(isLatestBatch),
					temporaryCategory: temporaryCategoryId
				});
			}
		} catch(error) {
			console.error('Error reloading data for language change:', error);
			$.set(hasError, true);
			$.set(errorMessage, error instanceof Error ? error.message : 'Failed to reload data', true);

			if ($$props.onError) {
				$$props.onError($.get(errorMessage));
			}
		}
	}

	// Load data when component mounts
	onMount(() => {
		console.log(`🚀 DataLoader mounted - loading initial data`);
		loadInitialData();

		// Register reload callback - we DON'T unregister on unmount because:
		// 1. DataLoader unmounts after initial load (when dataLoaded becomes true)
		// 2. But we still need the callback for language changes, time travel, etc.
		// 3. The callback captures the parent's onDataLoaded which stays valid
		dataReloadService.onReload(reloadAllData);
	});

	// Watch for batch changes (time travel mode toggle)
	let previousBatchId = null;

	$.user_effect(() => {
		const currentBatchId = timeTravelBatch.batchId;

		// If batch changed and we're not in initial loading
		if (currentBatchId !== previousBatchId && !$.get(initialLoading) && previousBatchId !== null) {
			// Skip if a reload is already in progress (e.g., from timeTravelNavigationService)
			if (dataReloadService.isReloading()) {
				console.log(`🔄 Batch changed but reload already in progress, skipping...`);
				previousBatchId = currentBatchId;

				return;
			}

			console.log(`🔄 Batch changed from ${previousBatchId} to ${currentBatchId}, reloading data...`);
			previousBatchId = currentBatchId;

			// If clearing batch (going back to latest), set isLatestBatch to true
			// Otherwise, loadInitialData will determine it by comparing to actual latest batch
			if (currentBatchId === null) {
				$.set(isLatestBatch, true);
			}

			// Show loading screen briefly
			$.set(initialLoading, true);

			$.set(loadingProgress, 0);
			$.set(loadingStage, s('loading.loadingData') || 'Loading news data...', true);

			// Load new data
			setTimeout(
				() => {
					loadInitialData();
				},
				100
			);
		} else {
			previousBatchId = currentBatchId;
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(loadingProgress) > 5);

				SplashScreen($$anchor, {
					get showProgress() {
						return $.get($0);
					},

					get progress() {
						return $.get(loadingProgress);
					},

					get stage() {
						return $.get(loadingStage);
					},

					get hasError() {
						return $.get(hasError);
					},

					get errorMessage() {
						return $.get(errorMessage);
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if ($.get(initialLoading)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}