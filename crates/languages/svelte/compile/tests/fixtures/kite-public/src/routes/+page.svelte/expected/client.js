import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<link rel="preload" as="image" href="/doggo_default.svg"/>`);
var root_1 = $.from_html(`<div class="md:hidden"><!></div>`);
var root_2 = $.from_html(`<div class="hidden md:block"><!></div>`);
var root_3 = $.from_html(`<div class="mt-4 mb-6 border-l-4 border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 pl-4 pr-3 py-3 flex items-center justify-between gap-4"><p class="text-sm text-gray-700 dark:text-gray-300"><!></p> <button class="flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors underline"> </button></div>`);
var root_4 = $.from_html(`<div class="mt-4 mb-6 border-l-4 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 pl-4 pr-3 py-3 flex items-center justify-between gap-4"><p class="text-sm text-blue-700 dark:text-blue-300"><!></p> <button class="flex-shrink-0 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors underline"> </button></div>`);
var root_5 = $.from_html(`<div class="min-h-[300px]" aria-live="polite" aria-busy="true"><span class="sr-only"> </span> <!></div>`);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!>  <!>`, 1);
var root_8 = $.from_html(`<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-max focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"> </a> <!> <div class="md:hidden sticky top-0 z-modal-backdrop bg-white dark:bg-gray-900 shadow-sm relative"><div class="px-3 py-2"><!></div> <!></div> <!> <main><div class="hidden md:block px-4"><!></div> <div><!> <div id="main-content"><!> <!> <!></div> <!></div></main>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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
	$.user_effect(() => {
		const readCount = Object.values(state.readStories).filter(Boolean).length;

		state.totalStoriesRead = readCount;
	});

	// Effect to update temporary category element reference
	$.user_effect(() => {
		if (state.temporaryCategory && state.desktopCategoryNavigation && state.showTemporaryCategoryTooltip) {
			state.temporaryCategoryElement = state.desktopCategoryNavigation.getCategoryElement(state.temporaryCategory);
		} else {
			state.temporaryCategoryElement = null;
		}
	});

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

	var fragment = root_9();

	$.head('1uha8ag', ($$anchor) => {
		var link = root();

		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			const urlParams = $.derived(parseInitialUrl);

			DataLoader($$anchor, {
				get onDataLoaded() {
					return dataHandlers.handleDataLoaded;
				},

				get onError() {
					return dataHandlers.handleDataError;
				},

				get initialBatchId() {
					return $.get(urlParams).batchId;
				},

				get initialCategoryId() {
					return $.get(urlParams).categoryId;
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			IntroScreen($$anchor, {
				visible: true,
				get onClose() {
					return helpers.handleIntroClose;
				}
			});
		};

		var alternate_3 = ($$anchor) => {
			var fragment_3 = root_8();
			var a = $.first_child(fragment_3);
			var text = $.only_child(a, true);
			var node_1 = $.sibling(a, 2);

			{
				let $0 = $.derived(() => derived.isSinglePageMode ? derived.singlePageStories : state.stories);

				$.bind_this(
					HistoryManager(node_1, {
						get batchId() {
							return state.currentBatchId;
						},

						get dateSlug() {
							return state.currentDateSlug;
						},

						get batchCreatedAt() {
							return state.currentBatchCreatedAt;
						},

						get categoryId() {
							return state.currentCategory;
						},

						get storyIndex() {
							return derived.currentStoryIndex;
						},

						get stories() {
							return $.get($0);
						},

						get isLatestBatch() {
							return state.isLatestBatch;
						},
						onNavigate: handleUrlNavigation,
						get isSharedView() {
							return state.isSharedArticleView;
						},

						set isSharedView($$value) {
							state.isSharedArticleView = $$value;
						}
					}),
					($$value) => state.historyManager = $$value,
					() => state?.historyManager
				);
			}

			var div = $.sibling(node_1, 2);
			var div_1 = $.child(div);
			var node_2 = $.child(div_1);

			Header(node_2, {
				get offlineMode() {
					return state.offlineMode;
				},

				get totalReadCount() {
					return state.totalReadCount;
				},

				get totalStoriesRead() {
					return state.totalStoriesRead;
				},

				get getLastUpdated() {
					return helpers.getLastUpdated;
				},

				get lastUpdatedTimestamp() {
					return state.lastUpdatedTimestamp;
				},

				get chaosIndex() {
					return state.chaosIndex;
				},

				get dataLoaded() {
					return state.dataLoaded;
				},

				get isSharedView() {
					return state.isSharedArticleView;
				},

				get onLogoClick() {
					return helpers.handleLogoClick;
				},
				onSearchClick: () => state.showSearchModal = true,
				get chaosModalOpen() {
					return state.chaosModalOpen;
				},

				set chaosModalOpen($$value) {
					state.chaosModalOpen = $$value;
				}
			});

			$.reset(div_1);

			var node_3 = $.sibling(div_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					CategoryNavigation($$anchor, {
						get categories() {
							return derived.orderedCategories;
						},

						get currentCategory() {
							return state.currentCategory;
						},

						get onCategoryChange() {
							return categoryManager.handleCategoryChange;
						},
						onCategoryDoubleClick: () => state.storyList?.toggleExpandAll(),
						mobilePosition: 'integrated',
						get temporaryCategory() {
							return state.temporaryCategory;
						},
						showTemporaryTooltip: false
					});
				};

				$.if(node_3, ($$render) => {
					if (derived.categoryHeaderPosition === "top" && !state.isSharedArticleView && !derived.isSinglePageMode) $$render(consequent_2);
				});
			}

			$.reset(div);

			var node_4 = $.sibling(div, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_2 = root_1();
					var node_5 = $.child(div_2);

					CategoryNavigation(node_5, {
						get categories() {
							return derived.orderedCategories;
						},

						get currentCategory() {
							return state.currentCategory;
						},

						get onCategoryChange() {
							return categoryManager.handleCategoryChange;
						},
						onCategoryDoubleClick: () => state.storyList?.toggleExpandAll(),
						mobilePosition: 'bottom',
						get temporaryCategory() {
							return state.temporaryCategory;
						},
						showTemporaryTooltip: false
					});

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_4, ($$render) => {
					if (derived.categoryHeaderPosition === "bottom" && !state.isSharedArticleView && !derived.isSinglePageMode) $$render(consequent_3);
				});
			}

			var main = $.sibling(node_4, 2);
			var div_3 = $.child(main);
			var node_6 = $.child(div_3);

			Header(node_6, {
				get offlineMode() {
					return state.offlineMode;
				},

				get totalReadCount() {
					return state.totalReadCount;
				},

				get totalStoriesRead() {
					return state.totalStoriesRead;
				},

				get getLastUpdated() {
					return helpers.getLastUpdated;
				},

				get lastUpdatedTimestamp() {
					return state.lastUpdatedTimestamp;
				},

				get chaosIndex() {
					return state.chaosIndex;
				},

				get dataLoaded() {
					return state.dataLoaded;
				},

				get isSharedView() {
					return state.isSharedArticleView;
				},

				get onLogoClick() {
					return helpers.handleLogoClick;
				},
				onSearchClick: () => state.showSearchModal = true,
				get chaosModalOpen() {
					return state.chaosModalOpen;
				},

				set chaosModalOpen($$value) {
					state.chaosModalOpen = $$value;
				}
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_7 = $.child(div_4);

			{
				var consequent_4 = ($$anchor) => {
					var div_5 = root_2();
					var node_8 = $.child(div_5);

					$.bind_this(
						CategoryNavigation(node_8, {
							get categories() {
								return derived.orderedCategories;
							},

							get currentCategory() {
								return state.currentCategory;
							},

							get onCategoryChange() {
								return categoryManager.handleCategoryChange;
							},
							onCategoryDoubleClick: () => state.storyList?.toggleExpandAll(),
							mobilePosition: 'bottom',
							get temporaryCategory() {
								return state.temporaryCategory;
							},

							get showTemporaryTooltip() {
								return state.showTemporaryCategoryTooltip;
							},

							onTemporaryScrollStart: () => {
								state.showTemporaryCategoryTooltip = false;
							},

							onTemporaryScrollEnd: () => {
								state.showTemporaryCategoryTooltip = true;
							}
						}),
						($$value) => state.desktopCategoryNavigation = $$value,
						() => state?.desktopCategoryNavigation
					);

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				$.if(node_7, ($$render) => {
					if (!state.isSharedArticleView && !derived.isSinglePageMode) $$render(consequent_4);
				});
			}

			var div_6 = $.sibling(node_7, 2);
			var node_9 = $.child(div_6);

			{
				var consequent_6 = ($$anchor) => {
					const batchDate = $.derived(() => state.currentBatchCreatedAt ? new Date(state.currentBatchCreatedAt) : null);
					const isValidDate = $.derived(() => $.get(batchDate) && !isNaN($.get(batchDate).getTime()));

					const formattedDate = $.derived(() => $.get(isValidDate)
						? $.get(batchDate).toLocaleDateString(languageSettings.ui === 'default' ? undefined : languageSettings.ui, { year: 'numeric', month: 'long', day: 'numeric' })
						: '');

					var div_7 = root_3();
					var p = $.child(div_7);
					var node_10 = $.child(p);

					{
						var consequent_5 = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(($0) => $.set_text(text_1, $0), [
								() => s("shared.viewingStoryFrom", { date: $.get(formattedDate) }) || `Viewing a shared story from ${$.get(formattedDate)}`
							]);

							$.append($$anchor, text_1);
						};

						var alternate = ($$anchor) => {
							var text_2 = $.text();

							$.template_effect(($0) => $.set_text(text_2, $0), [
								() => s("shared.viewingSharedStory") || "Viewing a shared story"
							]);

							$.append($$anchor, text_2);
						};

						$.if(node_10, ($$render) => {
							if ($.get(isValidDate)) $$render(consequent_5); else $$render(alternate, -1);
						});
					}

					$.reset(p);

					var button = $.sibling(p, 2);
					var text_3 = $.only_child(button, true);

					$.reset(div_7);
					$.template_effect(($0) => $.set_text(text_3, $0), [() => s("shared.viewLatest") || "View latest stories"]);

					$.delegated('click', button, function (...$$args) {
						helpers.handleExitSharedView?.apply(this, $$args);
					});

					$.append($$anchor, div_7);
				};

				$.if(node_9, ($$render) => {
					if (state.isSharedArticleView) $$render(consequent_6);
				});
			}

			var node_11 = $.sibling(node_9, 2);

			{
				var consequent_8 = ($$anchor) => {
					const batchDate = $.derived(() => state.currentBatchCreatedAt ? new Date(state.currentBatchCreatedAt) : null);
					const isValidDate = $.derived(() => $.get(batchDate) && !isNaN($.get(batchDate).getTime()));

					const formattedDate = $.derived(() => $.get(isValidDate)
						? $.get(batchDate).toLocaleDateString(languageSettings.ui === 'default' ? undefined : languageSettings.ui, { year: 'numeric', month: 'long', day: 'numeric' })
						: '');

					const hasReferrer = $.derived(() => browser && document.referrer && !document.referrer.includes(location.origin));
					var div_8 = root_4();
					var p_1 = $.child(div_8);
					var node_12 = $.child(p_1);

					{
						var consequent_7 = ($$anchor) => {
							var text_4 = $.text();

							$.template_effect(($0) => $.set_text(text_4, $0), [
								() => s("timeTravel.urlBanner.viewingShared", { date: $.get(formattedDate) }) || `Someone shared a link to news from ${$.get(formattedDate)} with you. You can return to today's news anytime using the ✕ next to the date above.`
							]);

							$.append($$anchor, text_4);
						};

						var alternate_1 = ($$anchor) => {
							var text_5 = $.text();

							$.template_effect(($0) => $.set_text(text_5, $0), [
								() => s("timeTravel.urlBanner.viewing", { date: $.get(formattedDate) }) || `This link points to news from ${$.get(formattedDate)}. You can return to today's news anytime using the ✕ next to the date above.`
							]);

							$.append($$anchor, text_5);
						};

						$.if(node_12, ($$render) => {
							if ($.get(hasReferrer)) $$render(consequent_7); else $$render(alternate_1, -1);
						});
					}

					$.reset(p_1);

					var button_1 = $.sibling(p_1, 2);
					var text_6 = $.only_child(button_1, true);

					$.reset(div_8);
					$.template_effect(($0) => $.set_text(text_6, $0), [() => s("timeTravel.urlBanner.dismiss") || "Got it"]);
					$.delegated('click', button_1, dismissTimeTravelUrlBanner);
					$.append($$anchor, div_8);
				};

				$.if(node_11, ($$render) => {
					if (timeTravelBatch.isHistoricalBatch && timeTravelBatch.entrySource === 'url' && !settings.timeTravelBannerDismissed.currentValue && !state.isSharedArticleView) $$render(consequent_8);
				});
			}

			var node_13 = $.sibling(node_11, 2);

			{
				var consequent_9 = ($$anchor) => {
					var div_9 = root_5();
					var span = $.child(div_9);
					var text_7 = $.only_child(span, true);
					var node_14 = $.sibling(span, 2);

					$.each(node_14, 16, () => Array(10), $.index, ($$anchor, _, i) => {
						StoryCardSkeleton($$anchor, { variant: i });
					});

					$.reset(div_9);
					$.template_effect(($0) => $.set_text(text_7, $0), [() => s("loading.stories") || "Loading stories..."]);
					$.append($$anchor, div_9);
				};

				var consequent_10 = ($$anchor) => {
					{
						let $0 = $.derived(() => derived.singlePageMode === 'sequential');

						$.bind_this(
							StoryList($$anchor, {
								get stories() {
									return derived.singlePageStories;
								},
								currentCategory: 'all',
								categoryUuid: '',
								get batchId() {
									return state.currentBatchId;
								},

								get batchDateSlug() {
									return state.currentDateSlug;
								},

								get onStoryToggle() {
									return storyToggle.handleToggle;
								},
								storyCountOverride: null,
								get isSharedView() {
									return state.isSharedArticleView;
								},

								get sharedArticleIndex() {
									return state.sharedArticleIndex;
								},

								get sharedClusterId() {
									return state.sharedClusterId;
								},

								get initiallyExpandedIndex() {
									return state.initiallyExpandedStoryIndex;
								},

								get showCategoryLabels() {
									return $.get($0);
								},
								skipStoryCountLimit: true,
								get expandedStories() {
									return state.expandedStories;
								},

								set expandedStories($$value) {
									state.expandedStories = $$value;
								},

								get readStories() {
									return state.readStories;
								},

								set readStories($$value) {
									state.readStories = $$value;
								},

								get showSourceOverlay() {
									return state.showSourceOverlay;
								},

								set showSourceOverlay($$value) {
									state.showSourceOverlay = $$value;
								},

								get currentSource() {
									return state.currentSource;
								},

								set currentSource($$value) {
									state.currentSource = $$value;
								},

								get sourceArticles() {
									return state.sourceArticles;
								},

								set sourceArticles($$value) {
									state.sourceArticles = $$value;
								},

								get currentMediaInfo() {
									return state.currentMediaInfo;
								},

								set currentMediaInfo($$value) {
									state.currentMediaInfo = $$value;
								},

								get isLoadingMediaInfo() {
									return state.isLoadingMediaInfo;
								},

								set isLoadingMediaInfo($$value) {
									state.isLoadingMediaInfo = $$value;
								}
							}),
							($$value) => state.storyList = $$value,
							() => state?.storyList
						);
					}
				};

				var consequent_11 = ($$anchor) => {
					OnThisDay($$anchor, {
						get stories() {
							return state.onThisDayEvents;
						},

						get language() {
							return state.onThisDayLanguage;
						},

						get onWikipediaClick() {
							return helpers.handleWikipediaClick;
						}
					});
				};

				var alternate_2 = ($$anchor) => {
					var fragment_12 = root_7();
					var node_15 = $.first_child(fragment_12);

					{
						var consequent_12 = ($$anchor) => {
							var fragment_13 = root_6();
							var node_16 = $.first_child(fragment_13);

							NHLScores(node_16, {});

							var node_17 = $.sibling(node_16, 2);

							NHLStandings(node_17, {});
							$.append($$anchor, fragment_13);
						};

						var d = $.derived(() => state.currentCategory.toLowerCase() === "nhl");

						$.if(node_15, ($$render) => {
							if ($.get(d)) $$render(consequent_12);
						});
					}

					var node_18 = $.sibling(node_15, 2);

					{
						var consequent_13 = ($$anchor) => {
							var fragment_14 = root_6();
							var node_19 = $.first_child(fragment_14);

							NFLScores(node_19, {});

							var node_20 = $.sibling(node_19, 2);

							NFLStandings(node_20, {});
							$.append($$anchor, fragment_14);
						};

						var d_1 = $.derived(() => state.currentCategory.toLowerCase() === "nfl");

						$.if(node_18, ($$render) => {
							if ($.get(d_1)) $$render(consequent_13);
						});
					}

					var node_21 = $.sibling(node_18, 2);

					{
						var consequent_14 = ($$anchor) => {
							var fragment_15 = root_6();
							var node_22 = $.first_child(fragment_15);

							F1Schedule(node_22, {});

							var node_23 = $.sibling(node_22, 2);

							F1Standings(node_23, {});
							$.append($$anchor, fragment_15);
						};

						var d_2 = $.derived(() => state.currentCategory.toLowerCase() === "formula_1");

						$.if(node_21, ($$render) => {
							if ($.get(d_2)) $$render(consequent_14);
						});
					}

					var node_24 = $.sibling(node_21, 2);

					{
						var consequent_15 = ($$anchor) => {
							CryptoPrice($$anchor, { cryptoId: 'bitcoin' });
						};

						var d_3 = $.derived(() => state.currentCategory.toLowerCase() === "bitcoin");

						$.if(node_24, ($$render) => {
							if ($.get(d_3)) $$render(consequent_15);
						});
					}

					var node_25 = $.sibling(node_24, 2);

					{
						var consequent_16 = ($$anchor) => {
							CryptoGrid($$anchor, {});
						};

						var d_4 = $.derived(() => state.currentCategory.toLowerCase() === "cryptocurrency");

						$.if(node_25, ($$render) => {
							if ($.get(d_4)) $$render(consequent_16);
						});
					}

					var node_26 = $.sibling(node_25, 2);

					$.bind_this(
						StoryList(node_26, {
							get stories() {
								return state.stories;
							},

							get currentCategory() {
								return state.currentCategory;
							},

							get categoryUuid() {
								return state.categoryMap[state.currentCategory];
							},

							get batchId() {
								return state.currentBatchId;
							},

							get batchDateSlug() {
								return state.currentDateSlug;
							},

							get onStoryToggle() {
								return storyToggle.handleToggle;
							},

							get storyCountOverride() {
								return state.storyCountOverride;
							},

							get isSharedView() {
								return state.isSharedArticleView;
							},

							get sharedArticleIndex() {
								return state.sharedArticleIndex;
							},

							get sharedClusterId() {
								return state.sharedClusterId;
							},

							get initiallyExpandedIndex() {
								return state.initiallyExpandedStoryIndex;
							},

							get expandedStories() {
								return state.expandedStories;
							},

							set expandedStories($$value) {
								state.expandedStories = $$value;
							},

							get readStories() {
								return state.readStories;
							},

							set readStories($$value) {
								state.readStories = $$value;
							},

							get showSourceOverlay() {
								return state.showSourceOverlay;
							},

							set showSourceOverlay($$value) {
								state.showSourceOverlay = $$value;
							},

							get currentSource() {
								return state.currentSource;
							},

							set currentSource($$value) {
								state.currentSource = $$value;
							},

							get sourceArticles() {
								return state.sourceArticles;
							},

							set sourceArticles($$value) {
								state.sourceArticles = $$value;
							},

							get currentMediaInfo() {
								return state.currentMediaInfo;
							},

							set currentMediaInfo($$value) {
								state.currentMediaInfo = $$value;
							},

							get isLoadingMediaInfo() {
								return state.isLoadingMediaInfo;
							},

							set isLoadingMediaInfo($$value) {
								state.isLoadingMediaInfo = $$value;
							}
						}),
						($$value) => state.storyList = $$value,
						() => state?.storyList
					);

					$.append($$anchor, fragment_12);
				};

				$.if(node_13, ($$render) => {
					if (state.isLoadingCategory) $$render(consequent_9); else if (derived.isSinglePageMode) $$render(consequent_10, 1); else if (state.currentCategory === "onthisday") $$render(consequent_11, 2); else $$render(alternate_2, -1);
				});
			}

			$.reset(div_6);

			var node_27 = $.sibling(div_6, 2);

			Footer(node_27, {
				get currentCategory() {
					return state.currentCategory;
				},

				get categories() {
					return state.categories;
				},

				get stories() {
					return state.stories;
				},

				onShowAbout: () => {
					displaySettings.showIntro = true;
				}
			});

			$.reset(div_4);
			$.reset(main);

			$.template_effect(
				($0, $1) => {
					$.set_text(text, $0);
					$.set_class(main, 1, `pb-[56px] md:pb-0 relative z-20 ${derived.categoryHeaderPosition === 'top' ? 'pt-0' : ''}`);
					$.set_class(div_4, 1, `container mx-auto ${$1 ?? ''} px-4`);
				},
				[
					() => s("ui.skipToMainContent") || "Skip to main content",
					() => getContainerWidthClass()
				]
			);

			$.delegated(
				'touchstart',
				main,
				function (...$$args) {
					categorySwipeHandler.handleTouchStart?.apply(this, $$args);
				},
				void 0,
				true
			);

			$.delegated(
				'touchmove',
				main,
				function (...$$args) {
					categorySwipeHandler.handleTouchMove?.apply(this, $$args);
				},
				void 0,
				true
			);

			$.delegated('touchend', main, function (...$$args) {
				categorySwipeHandler.handleTouchEnd?.apply(this, $$args);
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (!state.dataLoaded) $$render(consequent); else if (displaySettings.showIntro || state.showAboutPage) $$render(consequent_1, 1); else $$render(alternate_3, -1);
		});
	}

	var node_28 = $.sibling(node, 2);

	Settings(node_28, {
		get visible() {
			return settingsModalState.isOpen;
		},

		get categories() {
			return state.categories;
		},

		onClose: () => {
			settingsModalState.isOpen = false;
		},

		onShowAbout: () => {
			settingsModalState.isOpen = false;
			displaySettings.showIntro = true;
		}
	});

	var node_29 = $.sibling(node_28, 2);

	TimeTravel(node_29, {});

	var node_30 = $.sibling(node_29, 2);

	SourceOverlay(node_30, {
		get isOpen() {
			return state.showSourceOverlay;
		},

		get currentSource() {
			return state.currentSource;
		},

		get sourceArticles() {
			return state.sourceArticles;
		},

		get currentMediaInfo() {
			return state.currentMediaInfo;
		},

		get isLoadingMediaInfo() {
			return state.isLoadingMediaInfo;
		},

		get onClose() {
			return helpers.handleCloseSource;
		}
	});

	var node_31 = $.sibling(node_30, 2);

	WikipediaPopup(node_31, {
		get visible() {
			return state.wikipediaPopup.visible;
		},

		get title() {
			return state.wikipediaPopup.title;
		},

		get content() {
			return state.wikipediaPopup.content;
		},

		get imageUrl() {
			return state.wikipediaPopup.imageUrl;
		},

		get onClose() {
			return helpers.closeWikipediaPopup;
		}
	});

	var node_32 = $.sibling(node_31, 2);

	TemporaryCategoryTooltip(node_32, {
		get show() {
			return state.showTemporaryCategoryTooltip;
		},

		get referenceElement() {
			return state.temporaryCategoryElement;
		}
	});

	var node_33 = $.sibling(node_32, 2);

	SearchModal(node_33, {
		get visible() {
			return state.showSearchModal;
		},

		get allCategoryStories() {
			return state.allCategoryStories;
		},

		get categories() {
			return state.categories;
		},

		get currentCategory() {
			return state.currentCategory;
		},
		onClose: () => state.showSearchModal = false,
		get onSelectStory() {
			return helpers.handleSearchSelectStory;
		}
	});

	var node_34 = $.sibling(node_33, 2);

	{
		var consequent_17 = ($$anchor) => {
			BackToTop($$anchor, {});
		};

		$.if(node_34, ($$render) => {
			if (state.dataLoaded && !state.showOnboarding && !displaySettings.showIntro) $$render(consequent_17);
		});
	}

	var node_35 = $.sibling(node_34, 2);

	Toast(node_35, {});

	var node_36 = $.sibling(node_35, 2);

	{
		var consequent_18 = ($$anchor) => {
			KeyboardNavigationHandler($$anchor, {
				get stories() {
					return state.stories;
				},

				get currentCategory() {
					return state.currentCategory;
				},

				get categories() {
					return derived.orderedCategories;
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

				get settingsModalOpen() {
					return settingsModalState.isOpen;
				},

				get onStoryToggle() {
					return storyToggle.handleToggle;
				},
				onToggleReadStatus: (index) => state.storyList?.toggleReadStatus(index),
				get onCategoryChange() {
					return categoryManager.handleCategoryChange;
				},

				get showSearchModal() {
					return state.showSearchModal;
				},

				set showSearchModal($$value) {
					state.showSearchModal = $$value;
				}
			});
		};

		$.if(node_36, ($$render) => {
			if (state.dataLoaded) $$render(consequent_18);
		});
	}

	var node_37 = $.sibling(node_36, 2);

	KeyboardShortcutsHelp(node_37, {});
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['touchstart', 'touchmove', 'touchend', 'click']);