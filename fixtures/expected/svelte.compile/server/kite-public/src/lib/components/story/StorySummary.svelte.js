import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import GlobePreview from '$lib/components/common/GlobePreview.svelte';
import { geocodeLocation } from '$lib/data/countryCoordinates';
import { displaySettings } from '$lib/data/settings.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { getMapServiceName, openMapLocation } from '$lib/utils/mapUtils';
import { getMapsProviderDisplayName } from '$lib/utils/mapsProvider';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';
import { flip, offset, shift, useFloating } from '@skeletonlabs/floating-ui-svelte';
import { getContext, onDestroy } from 'svelte';
import Portal from 'svelte-portal';

export default function StorySummary($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			story,
			citationMapping,
			storyLocalizer = s,
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick
		} = $$props;

		// Get session from context for maps provider detection
		const session = getContext('session');

		// Handle location click
		function handleLocationClick() {
			if (story.location) {
				openMapLocation(story.location, undefined, session);
			}
		}

		// Handle location keyboard events
		function handleLocationKeydown(event) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				handleLocationClick();
			}
		}

		// Get the map service name for accessibility
		const mapServiceName = $.derived(() => getMapsProviderDisplayName(displaySettings.mapsProvider, session));

		// Convert citations to numbered format if mapping is available
		const displaySummary = $.derived(() => {
			if (!citationMapping) return story.short_summary || '';

			return replaceWithNumberedCitations(story.short_summary || '', citationMapping);
		});

		const displayLocation = $.derived(() => {
			if (!citationMapping || !story.location) return story.location || '';

			return replaceWithNumberedCitations(story.location, citationMapping);
		});

		// Get cited articles for summary
		const summaryCitedArticles = $.derived(() => {
			return getCitedArticlesForText(displaySummary(), citationMapping, story.articles || []);
		});

		// Get cited articles for location
		const locationCitedArticles = $.derived(() => {
			if (!displayLocation()) return null;

			return getCitedArticlesForText(displayLocation(), citationMapping, story.articles || []);
		});

		// Only enable globe on devices with a fine pointer (mouse) — skip all globe JS on touch devices
		const hasMousePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

		// Globe floating popup state (only initialized on desktop)
		let showGlobe = false;

		let globeCoords = null;
		let locationButtonEl = undefined;
		let hideTimeout = null;

		// Floating UI for globe popup
		const floating = hasMousePointer
			? useFloating({
				placement: 'bottom-start',
				strategy: 'fixed',
				middleware: [
					offset(8),
					flip({ fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] }),
					shift({ padding: 8 })
				]
			})
			: null;

		// Prefetch coordinates only on desktop
		// Geocoding failed; globe preview will simply not be shown
		// Bind the location button as the floating reference
		function handleLocationMouseEnter() {
			if (!hasMousePointer) return;

			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout = null;
			}

			if (globeCoords) showGlobe = true;
		}

		function handleLocationMouseLeave() {
			if (!hasMousePointer) return;

			hideTimeout = window.setTimeout(
				() => {
					showGlobe = false;
				},
				150
			);
		}

		function handlePopupEnter() {
			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout = null;
			}
		}

		function handlePopupLeave() {
			hideTimeout = window.setTimeout(
				() => {
					showGlobe = false;
				},
				150
			);
		}

		onDestroy(() => {
			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout = null;
			}
		});

		$$renderer.push(`<section class="mt-6"><div class="mb-6" dir="auto">`);

		if (flashcardMode) {
			$$renderer.push('<!--[0-->');

			SelectableText($$renderer, {
				text: displaySummary(),
				flashcardMode,
				selectedWords,
				selectedPhrases,
				shouldJiggle,
				onWordClick,
				section: 'short_summary'
			});
		} else {
			$$renderer.push('<!--[-1-->');

			CitationText($$renderer, {
				text: displaySummary(),
				showFavicons: false,
				showNumbers: false,
				inline: false,
				articles: summaryCitedArticles().citedArticles,
				citationMapping,
				storyLocalizer
			});
		}

		$$renderer.push(`<!--]--></div> `);

		if (story.location) {
			$$renderer.push(`<!--[0--><button class="flex cursor-pointer items-center text-gray-600 dark:text-gray-300 bg-transparent border-none p-0 focus-visible-ring rounded"${$.attr('aria-label', `View ${$.stringify(story.location)} on ${$.stringify(mapServiceName())}`)}><img src="/svg/map.svg" alt="Map icon" class="mr-2 h-5 w-5"/> `);

			Tooltip($$renderer, {
				text: storyLocalizer("article.location") || `View on ${mapServiceName()}`,
				position: 'top',
				children: ($$renderer) => {
					$$renderer.push(`<span dir="auto">`);

					CitationText($$renderer, {
						text: displayLocation(),
						showFavicons: false,
						showNumbers: false,
						inline: true,
						articles: locationCitedArticles()?.citedArticles || [],
						citationMapping,
						storyLocalizer
					});

					$$renderer.push(`<!----></span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section> `);

		if (showGlobe && globeCoords && floating) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class(`absolute top-0 left-0 z-tooltip overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg transition-opacity duration-200 dark:border-gray-600 dark:bg-gray-800 ${floating.isPositioned ? 'opacity-100' : 'opacity-0 invisible'}`)}${$.attr_style(floating.floatingStyles)} role="tooltip"><div class="p-2">`);

					GlobePreview($$renderer, {
						lat: globeCoords.lat,
						lng: globeCoords.lng,
						size: typeof window !== "undefined" && window.innerWidth >= 768 ? 220 : 160
					});

					$$renderer.push(`<!----></div></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}