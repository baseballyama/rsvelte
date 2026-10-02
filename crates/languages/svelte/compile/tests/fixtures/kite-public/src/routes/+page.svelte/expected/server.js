import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { browser } from '$app/environment';
import { page } from '$app/state';
import { s } from '$lib/client/localization.svelte';
import BackToTop from '$lib/components/BackToTop.svelte';
import CategoryNavigation from '$lib/components/CategoryNavigation.svelte';
import CryptoGrid from '$lib/components/crypto/CryptoGrid.svelte';
import CryptoPrice from '$lib/components/crypto/CryptoPrice.svelte';
import DataLoader from '$lib/components/DataLoader.svelte';
import Footer from '$lib/components/Footer.svelte';
import F1Schedule from '$lib/components/f1/F1Schedule.svelte';
import F1Standings from '$lib/components/f1/F1Standings.svelte';
import Header from '$lib/components/Header.svelte';
import HistoryManager from '$lib/components/HistoryManager.svelte';
import IntroScreen from '$lib/components/IntroScreen.svelte';
import KeyboardNavigationHandler from '$lib/components/KeyboardNavigationHandler.svelte';
import KeyboardShortcutsHelp from '$lib/components/KeyboardShortcutsHelp.svelte';
import NFLScores from '$lib/components/nfl/NFLScores.svelte';
import NFLStandings from '$lib/components/nfl/NFLStandings.svelte';
import NHLScores from '$lib/components/nhl/NHLScores.svelte';
import NHLStandings from '$lib/components/nhl/NHLStandings.svelte';
import OnThisDay from '$lib/components/OnThisDay.svelte';
import Settings from '$lib/components/Settings.svelte';
import SourceOverlay from '$lib/components/SourceOverlay.svelte';
import StoryList from '$lib/components/StoryList.svelte';
import { SearchModal } from '$lib/components/search';
import StoryCardSkeleton from '$lib/components/story/StoryCardSkeleton.svelte';
import TemporaryCategoryTooltip from '$lib/components/TemporaryCategoryTooltip.svelte';
import TimeTravel from '$lib/components/TimeTravel.svelte';
import Toast from '$lib/components/Toast.svelte';
import WikipediaPopup from '$lib/components/WikipediaPopup.svelte';
import Weather from '$lib/components/weather/Weather.svelte';

import {
	displaySettings,
	languageSettings,
	settings,
	settingsModalState
} from '$lib/data/settings.svelte.js';

import { imagePreloadingService } from '$lib/services/imagePreloadingService';
import { navigationHandlerService } from '$lib/services/navigationHandlerService';
import { timeTravelBatch } from '$lib/stores/timeTravelBatch.svelte';
import { UrlNavigationService } from '$lib/services/urlNavigationService';
import { categorySwipeHandler } from '$lib/utils/categorySwipeHandler';
import { clearImageCache, extractStoryImages, getImageCacheStats } from '$lib/utils/imagePreloader';
import { useCategoryManager } from '$lib/hooks/useCategoryManager.svelte';
import { useDataHandlers } from '$lib/hooks/useDataHandlers.svelte';
import { usePageDerived } from '$lib/hooks/usePageDerived.svelte';
import { usePageEffects } from '$lib/hooks/usePageEffects.svelte';
import { usePageHelpers } from '$lib/hooks/usePageHelpers.svelte';
import { usePageSetup } from '$lib/hooks/usePageSetup.svelte';
import { usePageState } from '$lib/hooks/usePageState.svelte';
import { useSinglePageMode } from '$lib/hooks/useSinglePageMode.svelte';
import { useStoryToggle } from '$lib/hooks/useStoryToggle.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Helper function for layout width class
		function getContainerWidthClass() {
			switch (displaySettings.layoutWidth) {
				case 'wide':
					return 'max-w-4xl';

				case 'full':
					return 'max-w-full';

				default:
					return 'max-w-[732px]';
			}
		}

		// Composables
		// Initialize state
		const state = usePageState();

		// Derived state
		const derived = usePageDerived(() => ({
			categories: state.categories,
			temporaryCategory: state.temporaryCategory,
			stories: state.stories,
			expandedStories: state.expandedStories,
			allCategoryStories: state.allCategoryStories,
			storyCountOverride: state.storyCountOverride
		}));

		// Get session from context for subscription check
		const session = getContext('session');

		// Time travel URL banner - show once, remember dismissal (synced via settings)
		function dismissTimeTravelUrlBanner() {
			settings.timeTravelBannerDismissed.currentValue = true;
			settings.timeTravelBannerDismissed.save();
		}

		// Detect ?view=chaos on initial page load
		if (browser && page.url.searchParams.get('view') === 'chaos') {
			state.chaosModalOpen = true;
		}

		// Helper functions
		const parseInitialUrl = () => {
			if (!browser) return {};

			return UrlNavigationService.parseUrl(page.url);
		};

		// Helpers composable
		const helpers = usePageHelpers(
			{
				get lastUpdated() {
					return state.lastUpdated;
				},

				get expandedStories() {
					return state.expandedStories;
				},

				get showSourceOverlay() {
					return state.showSourceOverlay;
				},

				get wikipediaPopupVisible() {
					return state.wikipediaPopup.visible;
				},

				get currentCategory() {
					return state.currentCategory;
				},

				get orderedCategories() {
					return derived.orderedCategories;
				},

				get isLatestBatch() {
					return state.isLatestBatch;
				},

				get isSharedArticleView() {
					return state.isSharedArticleView;
				},

				get sharedArticleIndex() {
					return state.sharedArticleIndex;
				},

				get sharedClusterId() {
					return state.sharedClusterId;
				},

				get currentBatchCreatedAt() {
					return state.currentBatchCreatedAt;
				},

				get historyManager() {
					return state.historyManager;
				},

				get initiallyExpandedStoryIndex() {
					return state.initiallyExpandedStoryIndex;
				},

				get readStories() {
					return state.readStories;
				},

				get totalStoriesRead() {
					return state.totalStoriesRead;
				}
			},
			{
				setExpandedStories: (v) => {
					state.expandedStories = v;
				},

				setInitiallyExpandedStoryIndex: (v) => {
					state.initiallyExpandedStoryIndex = v;
				},

				setShowSourceOverlay: (v) => {
					state.showSourceOverlay = v;
				},

				setCurrentSource: (v) => {
					state.currentSource = v;
				},

				setSourceArticles: (v) => {
					state.sourceArticles = v;
				},

				setCurrentMediaInfo: (v) => {
					state.currentMediaInfo = v;
				},

				setIsLoadingMediaInfo: (v) => {
					state.isLoadingMediaInfo = v;
				},

				setWikipediaPopup: (v) => {
					state.wikipediaPopup = v;
				},

				setShowSearchModal: (v) => {
					state.showSearchModal = v;
				},

				setIsSharedArticleView: (v) => {
					state.isSharedArticleView = v;
				},

				setSharedArticleIndex: (v) => {
					state.sharedArticleIndex = v;
				},

				setSharedClusterId: (v) => {
					state.sharedClusterId = v;
				},

				setReadStories: (v) => {
					state.readStories = v;
				},

				setTotalStoriesRead: (v) => {
					state.totalStoriesRead = v;
				},
				handleCategoryChange: (...args) => categoryManager.handleCategoryChange(...args),
				handleStoryToggle: (...args) => storyToggle.handleToggle(...args)
			}
		);

		// Data handlers
		const dataHandlers = useDataHandlers(
			{
				get categories() {
					return state.categories;
				},

				set categories(v) {
					state.categories = v;
				},

				get stories() {
					return state.stories;
				},

				set stories(v) {
					state.stories = v;
				},

				get totalReadCount() {
					return state.totalReadCount;
				},

				set totalReadCount(v) {
					state.totalReadCount = v;
				},

				get lastUpdated() {
					return state.lastUpdated;
				},

				set lastUpdated(v) {
					state.lastUpdated = v;
				},

				get lastUpdatedTimestamp() {
					return state.lastUpdatedTimestamp;
				},

				set lastUpdatedTimestamp(v) {
					state.lastUpdatedTimestamp = v;
				},

				get currentCategory() {
					return state.currentCategory;
				},

				set currentCategory(v) {
					state.currentCategory = v;
				},

				get allCategoryStories() {
					return state.allCategoryStories;
				},

				set allCategoryStories(v) {
					state.allCategoryStories = v;
				},

				get categoryMap() {
					return state.categoryMap;
				},

				set categoryMap(v) {
					state.categoryMap = v;
				},

				get currentBatchId() {
					return state.currentBatchId;
				},

				set currentBatchId(v) {
					state.currentBatchId = v;
				},

				get currentDateSlug() {
					return state.currentDateSlug;
				},

				set currentDateSlug(v) {
					state.currentDateSlug = v;
				},

				get currentBatchCreatedAt() {
					return state.currentBatchCreatedAt;
				},

				set currentBatchCreatedAt(v) {
					state.currentBatchCreatedAt = v;
				},

				get lastLoadedCategory() {
					return state.lastLoadedCategory;
				},

				set lastLoadedCategory(v) {
					state.lastLoadedCategory = v;
				},

				get isLatestBatch() {
					return state.isLatestBatch;
				},

				set isLatestBatch(v) {
					state.isLatestBatch = v;
				},

				get chaosIndex() {
					return state.chaosIndex;
				},

				set chaosIndex(v) {
					state.chaosIndex = v;
				},

				get temporaryCategory() {
					return state.temporaryCategory;
				},

				set temporaryCategory(v) {
					state.temporaryCategory = v;
				},

				get showTemporaryCategoryTooltip() {
					return state.showTemporaryCategoryTooltip;
				},

				set showTemporaryCategoryTooltip(v) {
					state.showTemporaryCategoryTooltip = v;
				},

				get dataLoaded() {
					return state.dataLoaded;
				},

				set dataLoaded(v) {
					state.dataLoaded = v;
				},

				get isLoadingCategory() {
					return state.isLoadingCategory;
				},

				set isLoadingCategory(v) {
					state.isLoadingCategory = v;
				},

				get onThisDayEvents() {
					return state.onThisDayEvents;
				},

				set onThisDayEvents(v) {
					state.onThisDayEvents = v;
				},

				get onThisDayLanguage() {
					return state.onThisDayLanguage;
				},

				set onThisDayLanguage(v) {
					state.onThisDayLanguage = v;
				},

				get expandedStories() {
					return state.expandedStories;
				},

				set expandedStories(v) {
					state.expandedStories = v;
				},

				get initiallyExpandedStoryIndex() {
					return state.initiallyExpandedStoryIndex;
				},

				set initiallyExpandedStoryIndex(v) {
					state.initiallyExpandedStoryIndex = v;
				},

				get storyCountOverride() {
					return state.storyCountOverride;
				},

				set storyCountOverride(v) {
					state.storyCountOverride = v;
				}
			},
			{
				updatePageTitle: (categoryId) => categoryManager.updatePageTitle(categoryId),
				closeSourceOverlay: helpers.handleCloseSource,
				closeWikipediaPopup: helpers.closeWikipediaPopup,
				historyManager: state.historyManager,
				parseInitialUrl,
				s
			}
		);

		// Category manager
		const categoryManager = useCategoryManager(() => ({
			categories: state.categories,
			currentCategory: state.currentCategory,
			temporaryCategory: state.temporaryCategory,
			historyManager: state.historyManager,
			isSinglePageMode: derived.isSinglePageMode,
			storyList: state.storyList,
			loadStoriesForCategory: dataHandlers.loadStoriesForCategory,
			updatePageTitle: (categoryId) => categoryManager.updatePageTitle(categoryId),
			setCurrentCategory: (categoryId) => {
				state.currentCategory = categoryId;
			},

			clearExpandedStories: () => {
				state.expandedStories = {};
			},

			clearInitiallyExpandedStoryIndex: () => {
				state.initiallyExpandedStoryIndex = null;
			},

			clearStoryCountOverride: () => {
				state.storyCountOverride = null;
			},

			clearTemporaryCategory: () => {
				state.temporaryCategory = null;
				state.showTemporaryCategoryTooltip = false;
			}
		}));

		// Story toggle handler
		const storyToggle = useStoryToggle(
			() => state.expandedStories,
			(value) => {
				state.expandedStories = value;
			},
			() => state.readStories,
			(value) => {
				state.readStories = value;
			},
			state.initiallyExpandedStoryIndex,
			() => state.historyManager,
			() => ({
				isSinglePageMode: derived.isSinglePageMode,
				singlePageStories: derived.singlePageStories,
				stories: state.stories,
				currentBatchId: state.currentBatchId,
				categoryMap: state.categoryMap,
				currentCategory: state.currentCategory,
				handleCategoryChange: categoryManager.handleCategoryChange
			})
		);

		// Page setup (onMount)
		usePageSetup({
			parseInitialUrl,
			s,
			setIsLoadingCategory: (v) => {
				state.isLoadingCategory = v;
			},

			setIsSharedArticleView: (v) => {
				state.isSharedArticleView = v;
			},

			setSharedArticleIndex: (v) => {
				state.sharedArticleIndex = v;
			},
			reloadReadStories: helpers.reloadReadStories
		});

		// Page effects
		usePageEffects(() => ({
			dataLoaded: state.dataLoaded,
			orderedCategories: derived.orderedCategories,
			currentCategory: state.currentCategory,
			temporaryCategory: state.temporaryCategory,
			lastLoadedCategory: state.lastLoadedCategory,
			loadStoriesForCategory: dataHandlers.loadStoriesForCategory,
			handleCategoryChange: categoryManager.handleCategoryChange,
			setCurrentCategory: (v) => {
				state.currentCategory = v;
			}
		}));

		// Parse initial URL once for single page scroll target
		const initialUrlParams = browser ? parseInitialUrl() : {};

		// Single page mode effects
		useSinglePageMode(() => ({
			isSinglePageMode: derived.isSinglePageMode,
			singlePageMode: derived.singlePageMode,
			dataLoaded: state.dataLoaded,
			orderedCategories: derived.orderedCategories,
			loadStoriesForCategory: dataHandlers.loadStoriesForCategory,
			historyManager: state.historyManager,
			currentCategory: state.currentCategory,
			initialCategoryFromUrl: initialUrlParams.categoryId
		}));

		// Effect to update read stories count
		// Effect to update temporary category element reference
		// Handle URL navigation
		const handleUrlNavigation = async (params) => {
			const hasStory = params.storyIndex !== null && params.storyIndex !== undefined || params.clusterId !== null && params.clusterId !== undefined;

			if (params.isShared && hasStory) {
				state.sharedArticleIndex = params.storyIndex ?? null;
				state.sharedClusterId = params.clusterId ?? null;
			} else if (!params.isShared) {
				state.sharedArticleIndex = null;
				state.sharedClusterId = null;
			}

			const updates = await navigationHandlerService.handleUrlNavigation(
				params,
				{
					currentBatchId: state.currentBatchId,
					currentDateSlug: state.currentDateSlug,
					currentCategory: state.currentCategory,
					categories: state.categories,
					stories: state.stories,
					allCategoryStories: state.allCategoryStories,
					expandedStories: state.expandedStories,
					isLatestBatch: state.isLatestBatch,
					storyCountOverride: state.storyCountOverride
				},
				{
					setDataLanguage: (lang) => {
						languageSettings.data = lang;
						settings.dataLanguage.save();
					},
					getCurrentDataLanguage: () => languageSettings.data,
					handleCategoryChange: categoryManager.handleCategoryChange
				}
			);

			if (updates.isLatestBatch !== undefined) state.isLatestBatch = updates.isLatestBatch;

			if (updates.expandedStories !== undefined) {
				state.expandedStories = updates.expandedStories;
			}

			if (updates.storyCountOverride !== undefined) {
				state.storyCountOverride = updates.storyCountOverride;
			}
		};

		// Debug helpers
		if (browser && typeof window !== 'undefined') {
			window.kiteDebug = {
				getCacheStats: getImageCacheStats,
				clearCache: clearImageCache,
				preloadCurrentCategory: () => imagePreloadingService.preloadCategory(state.stories),
				getCurrentStories: () => state.stories,
				getCurrentCategory: () => state.currentCategory,
				getAllCategoryStories: () => state.allCategoryStories,
				getPreloadedCategories: () => Object.keys(state.allCategoryStories),
				getImageUrls: () => {
					const allUrls = [];

					state.stories.forEach((story) => {
						allUrls.push(...extractStoryImages(story));
					});

					return [...new Set(allUrls)];
				},

				getAllImageUrls: () => {
					const allUrls = [];

					Object.values(state.allCategoryStories).flat().forEach((story) => {
						allUrls.push(...extractStoryImages(story));
					});

					return [...new Set(allUrls)];
				},

				showPreloadingSettings: () => {
					console.log('🔧 Enabling preloading settings tab');

					if (window.kiteSettingsDebug?.enablePreloadingTab) {
						window.kiteSettingsDebug.enablePreloadingTab();
						console.log('✅ Preloading settings tab enabled permanently.');

						return '✅ Preloading tab enabled permanently.';
					} else {
						console.log('❌ Settings component not available.');

						return '❌ Settings component not available.';
					}
				},

				hidePreloadingSettings: () => {
					console.log('🔧 Disabling preloading settings tab');

					if (window.kiteSettingsDebug?.disablePreloadingTab) {
						window.kiteSettingsDebug.disablePreloadingTab();
						console.log('✅ Preloading settings tab disabled.');

						return '✅ Preloading tab disabled.';
					} else {
						console.log('❌ Settings component not available.');

						return '❌ Settings component not available.';
					}
				},

				resetOnboarding: () => {
					localStorage.removeItem('kite-onboarding-completed');
					localStorage.setItem('introShown', 'false');
					console.log('✅ Onboarding reset.');

					return 'Onboarding reset.';
				},

				showOnboarding: () => {
					state.showOnboarding = true;
					console.log('✅ Showing onboarding modal.');

					return 'Showing onboarding modal.';
				}
			};
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1uha8ag', $$renderer, ($$renderer) => {
				$$renderer.push(`<link rel="preload" as="image" href="/doggo_default.svg"/>`);
			});

			if (!state.dataLoaded) {
				$$renderer.push('<!--[0-->');

				const urlParams = parseInitialUrl();

				DataLoader($$renderer, {
					onDataLoaded: dataHandlers.handleDataLoaded,
					onError: dataHandlers.handleDataError,
					initialBatchId: urlParams.batchId,
					initialCategoryId: urlParams.categoryId
				});
			} else if (displaySettings.showIntro || state.showAboutPage) {
				$$renderer.push('<!--[1-->');
				IntroScreen($$renderer, { visible: true, onClose: helpers.handleIntroClose });
			} else {
				$$renderer.push(`<!--[-1--><a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-max focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg">${$.escape(s("ui.skipToMainContent") || "Skip to main content")}</a> `);

				HistoryManager($$renderer, {
					batchId: state.currentBatchId,
					dateSlug: state.currentDateSlug,
					batchCreatedAt: state.currentBatchCreatedAt,
					categoryId: state.currentCategory,
					storyIndex: derived.currentStoryIndex,
					stories: derived.isSinglePageMode ? derived.singlePageStories : state.stories,
					isLatestBatch: state.isLatestBatch,
					onNavigate: handleUrlNavigation,
					get isSharedView() {
						return state.isSharedArticleView;
					},

					set isSharedView($$value) {
						state.isSharedArticleView = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <div class="md:hidden sticky top-0 z-modal-backdrop bg-white dark:bg-gray-900 shadow-sm relative"><div class="px-3 py-2">`);

				Header($$renderer, {
					offlineMode: state.offlineMode,
					totalReadCount: state.totalReadCount,
					totalStoriesRead: state.totalStoriesRead,
					getLastUpdated: helpers.getLastUpdated,
					lastUpdatedTimestamp: state.lastUpdatedTimestamp,
					chaosIndex: state.chaosIndex,
					dataLoaded: state.dataLoaded,
					isSharedView: state.isSharedArticleView,
					onLogoClick: helpers.handleLogoClick,
					onSearchClick: () => state.showSearchModal = true,
					get chaosModalOpen() {
						return state.chaosModalOpen;
					},

					set chaosModalOpen($$value) {
						state.chaosModalOpen = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> `);

				if (derived.categoryHeaderPosition === "top" && !state.isSharedArticleView && !derived.isSinglePageMode) {
					$$renderer.push('<!--[0-->');

					CategoryNavigation($$renderer, {
						categories: derived.orderedCategories,
						currentCategory: state.currentCategory,
						onCategoryChange: categoryManager.handleCategoryChange,
						onCategoryDoubleClick: () => state.storyList?.toggleExpandAll(),
						mobilePosition: 'integrated',
						temporaryCategory: state.temporaryCategory,
						showTemporaryTooltip: false
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (derived.categoryHeaderPosition === "bottom" && !state.isSharedArticleView && !derived.isSinglePageMode) {
					$$renderer.push(`<!--[0--><div class="md:hidden">`);

					CategoryNavigation($$renderer, {
						categories: derived.orderedCategories,
						currentCategory: state.currentCategory,
						onCategoryChange: categoryManager.handleCategoryChange,
						onCategoryDoubleClick: () => state.storyList?.toggleExpandAll(),
						mobilePosition: 'bottom',
						temporaryCategory: state.temporaryCategory,
						showTemporaryTooltip: false
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <main${$.attr_class(`pb-[56px] md:pb-0 relative z-20 ${derived.categoryHeaderPosition === 'top' ? 'pt-0' : ''}`)}><div class="hidden md:block px-4">`);

				Header($$renderer, {
					offlineMode: state.offlineMode,
					totalReadCount: state.totalReadCount,
					totalStoriesRead: state.totalStoriesRead,
					getLastUpdated: helpers.getLastUpdated,
					lastUpdatedTimestamp: state.lastUpdatedTimestamp,
					chaosIndex: state.chaosIndex,
					dataLoaded: state.dataLoaded,
					isSharedView: state.isSharedArticleView,
					onLogoClick: helpers.handleLogoClick,
					onSearchClick: () => state.showSearchModal = true,
					get chaosModalOpen() {
						return state.chaosModalOpen;
					},

					set chaosModalOpen($$value) {
						state.chaosModalOpen = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div${$.attr_class(`container mx-auto ${$.stringify(getContainerWidthClass())} px-4`)}>`);

				if (!state.isSharedArticleView && !derived.isSinglePageMode) {
					$$renderer.push(`<!--[0--><div class="hidden md:block">`);

					CategoryNavigation($$renderer, {
						categories: derived.orderedCategories,
						currentCategory: state.currentCategory,
						onCategoryChange: categoryManager.handleCategoryChange,
						onCategoryDoubleClick: () => state.storyList?.toggleExpandAll(),
						mobilePosition: 'bottom',
						temporaryCategory: state.temporaryCategory,
						showTemporaryTooltip: state.showTemporaryCategoryTooltip,
						onTemporaryScrollStart: () => {
							state.showTemporaryCategoryTooltip = false;
						},

						onTemporaryScrollEnd: () => {
							state.showTemporaryCategoryTooltip = true;
						}
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <div id="main-content">`);

				if (state.isSharedArticleView) {
					$$renderer.push('<!--[0-->');

					const batchDate = state.currentBatchCreatedAt ? new Date(state.currentBatchCreatedAt) : null;
					const isValidDate = batchDate && !isNaN(batchDate.getTime());

					const formattedDate = isValidDate
						? batchDate.toLocaleDateString(languageSettings.ui === 'default' ? undefined : languageSettings.ui, { year: 'numeric', month: 'long', day: 'numeric' })
						: '';

					$$renderer.push(`<div class="mt-4 mb-6 border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 pl-4 pr-3 py-3 flex items-center justify-between gap-4"><p class="text-sm text-gray-700 dark:text-gray-300">`);

					if (isValidDate) {
						$$renderer.push(`<!--[0-->${$.escape(s("shared.viewingStoryFrom", { date: formattedDate }) || `Viewing a shared story from ${formattedDate}`)}`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(s("shared.viewingSharedStory") || "Viewing a shared story")}`);
					}

					$$renderer.push(`<!--]--></p> <button class="flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors underline">${$.escape(s("shared.viewLatest") || "View latest stories")}</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (timeTravelBatch.isHistoricalBatch && timeTravelBatch.entrySource === 'url' && !settings.timeTravelBannerDismissed.currentValue && !state.isSharedArticleView) {
					$$renderer.push('<!--[0-->');

					const batchDate = state.currentBatchCreatedAt ? new Date(state.currentBatchCreatedAt) : null;
					const isValidDate = batchDate && !isNaN(batchDate.getTime());

					const formattedDate = isValidDate
						? batchDate.toLocaleDateString(languageSettings.ui === 'default' ? undefined : languageSettings.ui, { year: 'numeric', month: 'long', day: 'numeric' })
						: '';

					const hasReferrer = browser && document.referrer && !document.referrer.includes(location.origin);

					$$renderer.push(`<div class="mt-4 mb-6 border-l-4 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 pl-4 pr-3 py-3 flex items-center justify-between gap-4"><p class="text-sm text-blue-700 dark:text-blue-300">`);

					if (hasReferrer) {
						$$renderer.push(`<!--[0-->${$.escape(s("timeTravel.urlBanner.viewingShared", { date: formattedDate }) || `Someone shared a link to news from ${formattedDate} with you. You can return to today's news anytime using the ✕ next to the date above.`)}`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(s("timeTravel.urlBanner.viewing", { date: formattedDate }) || `This link points to news from ${formattedDate}. You can return to today's news anytime using the ✕ next to the date above.`)}`);
					}

					$$renderer.push(`<!--]--></p> <button class="flex-shrink-0 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors underline">${$.escape(s("timeTravel.urlBanner.dismiss") || "Got it")}</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (state.isLoadingCategory) {
					$$renderer.push(`<!--[0--><div class="min-h-[300px]" aria-live="polite" aria-busy="true"><span class="sr-only">${$.escape(s("loading.stories") || "Loading stories...")}</span> <!--[-->`);

					const each_array = $.ensure_array_like(Array(10));

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let _ = each_array[i];

						StoryCardSkeleton($$renderer, { variant: i });
					}

					$$renderer.push(`<!--]--></div>`);
				} else if (derived.isSinglePageMode) {
					$$renderer.push('<!--[1-->');

					StoryList($$renderer, {
						stories: derived.singlePageStories,
						currentCategory: 'all',
						categoryUuid: '',
						batchId: state.currentBatchId,
						batchDateSlug: state.currentDateSlug,
						onStoryToggle: storyToggle.handleToggle,
						storyCountOverride: null,
						isSharedView: state.isSharedArticleView,
						sharedArticleIndex: state.sharedArticleIndex,
						sharedClusterId: state.sharedClusterId,
						initiallyExpandedIndex: state.initiallyExpandedStoryIndex,
						showCategoryLabels: derived.singlePageMode === 'sequential',
						skipStoryCountLimit: true,
						get expandedStories() {
							return state.expandedStories;
						},

						set expandedStories($$value) {
							state.expandedStories = $$value;
							$$settled = false;
						},

						get readStories() {
							return state.readStories;
						},

						set readStories($$value) {
							state.readStories = $$value;
							$$settled = false;
						},

						get showSourceOverlay() {
							return state.showSourceOverlay;
						},

						set showSourceOverlay($$value) {
							state.showSourceOverlay = $$value;
							$$settled = false;
						},

						get currentSource() {
							return state.currentSource;
						},

						set currentSource($$value) {
							state.currentSource = $$value;
							$$settled = false;
						},

						get sourceArticles() {
							return state.sourceArticles;
						},

						set sourceArticles($$value) {
							state.sourceArticles = $$value;
							$$settled = false;
						},

						get currentMediaInfo() {
							return state.currentMediaInfo;
						},

						set currentMediaInfo($$value) {
							state.currentMediaInfo = $$value;
							$$settled = false;
						},

						get isLoadingMediaInfo() {
							return state.isLoadingMediaInfo;
						},

						set isLoadingMediaInfo($$value) {
							state.isLoadingMediaInfo = $$value;
							$$settled = false;
						}
					});
				} else if (state.currentCategory === "onthisday") {
					$$renderer.push('<!--[2-->');

					OnThisDay($$renderer, {
						stories: state.onThisDayEvents,
						language: state.onThisDayLanguage,
						onWikipediaClick: helpers.handleWikipediaClick
					});
				} else {
					$$renderer.push('<!--[-1-->');

					if (state.currentCategory.toLowerCase() === "nhl") {
						$$renderer.push('<!--[0-->');
						NHLScores($$renderer, {});
						$$renderer.push(`<!----> `);
						NHLStandings($$renderer, {});
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (state.currentCategory.toLowerCase() === "nfl") {
						$$renderer.push('<!--[0-->');
						NFLScores($$renderer, {});
						$$renderer.push(`<!----> `);
						NFLStandings($$renderer, {});
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (state.currentCategory.toLowerCase() === "formula_1") {
						$$renderer.push('<!--[0-->');
						F1Schedule($$renderer, {});
						$$renderer.push(`<!----> `);
						F1Standings($$renderer, {});
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (state.currentCategory.toLowerCase() === "bitcoin") {
						$$renderer.push('<!--[0-->');
						CryptoPrice($$renderer, { cryptoId: 'bitcoin' });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (state.currentCategory.toLowerCase() === "cryptocurrency") {
						$$renderer.push('<!--[0-->');
						CryptoGrid($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->  `);

					StoryList($$renderer, {
						stories: state.stories,
						currentCategory: state.currentCategory,
						categoryUuid: state.categoryMap[state.currentCategory],
						batchId: state.currentBatchId,
						batchDateSlug: state.currentDateSlug,
						onStoryToggle: storyToggle.handleToggle,
						storyCountOverride: state.storyCountOverride,
						isSharedView: state.isSharedArticleView,
						sharedArticleIndex: state.sharedArticleIndex,
						sharedClusterId: state.sharedClusterId,
						initiallyExpandedIndex: state.initiallyExpandedStoryIndex,
						get expandedStories() {
							return state.expandedStories;
						},

						set expandedStories($$value) {
							state.expandedStories = $$value;
							$$settled = false;
						},

						get readStories() {
							return state.readStories;
						},

						set readStories($$value) {
							state.readStories = $$value;
							$$settled = false;
						},

						get showSourceOverlay() {
							return state.showSourceOverlay;
						},

						set showSourceOverlay($$value) {
							state.showSourceOverlay = $$value;
							$$settled = false;
						},

						get currentSource() {
							return state.currentSource;
						},

						set currentSource($$value) {
							state.currentSource = $$value;
							$$settled = false;
						},

						get sourceArticles() {
							return state.sourceArticles;
						},

						set sourceArticles($$value) {
							state.sourceArticles = $$value;
							$$settled = false;
						},

						get currentMediaInfo() {
							return state.currentMediaInfo;
						},

						set currentMediaInfo($$value) {
							state.currentMediaInfo = $$value;
							$$settled = false;
						},

						get isLoadingMediaInfo() {
							return state.isLoadingMediaInfo;
						},

						set isLoadingMediaInfo($$value) {
							state.isLoadingMediaInfo = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--></div> `);

				Footer($$renderer, {
					currentCategory: state.currentCategory,
					categories: state.categories,
					stories: state.stories,
					onShowAbout: () => {
						displaySettings.showIntro = true;
					}
				});

				$$renderer.push(`<!----></div></main>`);
			}

			$$renderer.push(`<!--]--> `);

			Settings($$renderer, {
				visible: settingsModalState.isOpen,
				categories: state.categories,
				onClose: () => {
					settingsModalState.isOpen = false;
				},

				onShowAbout: () => {
					settingsModalState.isOpen = false;
					displaySettings.showIntro = true;
				}
			});

			$$renderer.push(`<!----> `);
			TimeTravel($$renderer, {});
			$$renderer.push(`<!----> `);

			SourceOverlay($$renderer, {
				isOpen: state.showSourceOverlay,
				currentSource: state.currentSource,
				sourceArticles: state.sourceArticles,
				currentMediaInfo: state.currentMediaInfo,
				isLoadingMediaInfo: state.isLoadingMediaInfo,
				onClose: helpers.handleCloseSource
			});

			$$renderer.push(`<!----> `);

			WikipediaPopup($$renderer, {
				visible: state.wikipediaPopup.visible,
				title: state.wikipediaPopup.title,
				content: state.wikipediaPopup.content,
				imageUrl: state.wikipediaPopup.imageUrl,
				onClose: helpers.closeWikipediaPopup
			});

			$$renderer.push(`<!----> `);

			TemporaryCategoryTooltip($$renderer, {
				show: state.showTemporaryCategoryTooltip,
				referenceElement: state.temporaryCategoryElement
			});

			$$renderer.push(`<!----> `);

			SearchModal($$renderer, {
				visible: state.showSearchModal,
				allCategoryStories: state.allCategoryStories,
				categories: state.categories,
				currentCategory: state.currentCategory,
				onClose: () => state.showSearchModal = false,
				onSelectStory: helpers.handleSearchSelectStory
			});

			$$renderer.push(`<!----> `);

			if (state.dataLoaded && !state.showOnboarding && !displaySettings.showIntro) {
				$$renderer.push('<!--[0-->');
				BackToTop($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			Toast($$renderer, {});
			$$renderer.push(`<!----> `);

			if (state.dataLoaded) {
				$$renderer.push('<!--[0-->');

				KeyboardNavigationHandler($$renderer, {
					stories: state.stories,
					currentCategory: state.currentCategory,
					categories: derived.orderedCategories,
					expandedStories: state.expandedStories,
					showSourceOverlay: state.showSourceOverlay,
					wikipediaPopupVisible: state.wikipediaPopup.visible,
					settingsModalOpen: settingsModalState.isOpen,
					onStoryToggle: storyToggle.handleToggle,
					onToggleReadStatus: (index) => state.storyList?.toggleReadStatus(index),
					onCategoryChange: categoryManager.handleCategoryChange,
					get showSearchModal() {
						return state.showSearchModal;
					},

					set showSearchModal($$value) {
						state.showSearchModal = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			KeyboardShortcutsHelp($$renderer, {});
			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}