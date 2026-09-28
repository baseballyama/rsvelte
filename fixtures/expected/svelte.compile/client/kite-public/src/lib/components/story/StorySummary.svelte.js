import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span dir="auto"><!></span>`);
var root_1 = $.from_html(`<button class="flex cursor-pointer items-center text-gray-600 dark:text-gray-300 bg-transparent border-none p-0 focus-visible-ring rounded"><img src="/svg/map.svg" alt="Map icon" class="mr-2 h-5 w-5"/> <!></button>`);
var root_2 = $.from_html(`<div role="tooltip"><div class="p-2"><!></div></div>`);
var root_3 = $.from_html(`<section class="mt-6"><div class="mb-6" dir="auto"><!></div> <!></section> <!>`, 1);

export default function StorySummary($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Get session from context for maps provider detection
	const session = getContext('session');

	// Handle location click
	function handleLocationClick() {
		if ($$props.story.location) {
			openMapLocation($$props.story.location, undefined, session);
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
		if (!$$props.citationMapping) return $$props.story.short_summary || '';

		return replaceWithNumberedCitations($$props.story.short_summary || '', $$props.citationMapping);
	});

	const displayLocation = $.derived(() => {
		if (!$$props.citationMapping || !$$props.story.location) return $$props.story.location || '';

		return replaceWithNumberedCitations($$props.story.location, $$props.citationMapping);
	});

	// Get cited articles for summary
	const summaryCitedArticles = $.derived(() => {
		return getCitedArticlesForText($.get(displaySummary), $$props.citationMapping, $$props.story.articles || []);
	});

	// Get cited articles for location
	const locationCitedArticles = $.derived(() => {
		if (!$.get(displayLocation)) return null;

		return getCitedArticlesForText($.get(displayLocation), $$props.citationMapping, $$props.story.articles || []);
	});

	// Only enable globe on devices with a fine pointer (mouse) — skip all globe JS on touch devices
	const hasMousePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

	// Globe floating popup state (only initialized on desktop)
	let showGlobe = $.state(false);

	let globeCoords = $.state(null);
	let locationButtonEl = $.state(undefined);
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
	$.user_effect(() => {
		if (hasMousePointer && $$props.story.location) {
			geocodeLocation($$props.story.location).then((coords) => {
				$.set(globeCoords, coords, true);
			}).catch(() => {
				// Geocoding failed; globe preview will simply not be shown
			});
		}
	});

	// Bind the location button as the floating reference
	$.user_effect(() => {
		if (floating && $.get(locationButtonEl)) {
			floating.elements.reference = $.get(locationButtonEl);
		}
	});

	function handleLocationMouseEnter() {
		if (!hasMousePointer) return;

		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}

		if ($.get(globeCoords)) $.set(showGlobe, true);
	}

	function handleLocationMouseLeave() {
		if (!hasMousePointer) return;

		hideTimeout = window.setTimeout(
			() => {
				$.set(showGlobe, false);
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
				$.set(showGlobe, false);
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

	var fragment = root_3();
	var section = $.first_child(fragment);
	var div = $.child(section);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			SelectableText($$anchor, {
				get text() {
					return $.get(displaySummary);
				},

				get flashcardMode() {
					return flashcardMode();
				},

				get selectedWords() {
					return selectedWords();
				},

				get selectedPhrases() {
					return selectedPhrases();
				},

				get shouldJiggle() {
					return shouldJiggle();
				},

				get onWordClick() {
					return $$props.onWordClick;
				},
				section: 'short_summary'
			});
		};

		var alternate = ($$anchor) => {
			CitationText($$anchor, {
				get text() {
					return $.get(displaySummary);
				},
				showFavicons: false,
				showNumbers: false,
				inline: false,
				get articles() {
					return $.get(summaryCitedArticles).citedArticles;
				},

				get citationMapping() {
					return $$props.citationMapping;
				},

				get storyLocalizer() {
					return storyLocalizer();
				}
			});
		};

		$.if(node, ($$render) => {
			if (flashcardMode()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	{
		var consequent_1 = ($$anchor) => {
			var button = root_1();
			var node_2 = $.sibling($.child(button), 2);

			{
				let $0 = $.derived(() => storyLocalizer()("article.location") || `View on ${$.get(mapServiceName)}`);

				Tooltip(node_2, {
					get text() {
						return $.get($0);
					},
					position: 'top',
					children: ($$anchor, $$slotProps) => {
						var span = root();
						var node_3 = $.child(span);

						{
							let $0 = $.derived(() => $.get(locationCitedArticles)?.citedArticles || []);

							CitationText(node_3, {
								get text() {
									return $.get(displayLocation);
								},
								showFavicons: false,
								showNumbers: false,
								inline: true,
								get articles() {
									return $.get($0);
								},

								get citationMapping() {
									return $$props.citationMapping;
								},

								get storyLocalizer() {
									return storyLocalizer();
								}
							});
						}

						$.reset(span);
						$.template_effect(() => span.dir = span.dir);
						$.delegated('click', span, handleLocationClick);
						$.append($$anchor, span);
					},
					$$slots: { default: true }
				});
			}

			$.reset(button);
			$.bind_this(button, ($$value) => $.set(locationButtonEl, $$value), () => $.get(locationButtonEl));
			$.template_effect(() => $.set_attribute(button, 'aria-label', `View ${$$props.story.location ?? ''} on ${$.get(mapServiceName) ?? ''}`));
			$.delegated('click', button, handleLocationClick);
			$.delegated('keydown', button, handleLocationKeydown);
			$.event('mouseenter', button, handleLocationMouseEnter);
			$.event('mouseleave', button, handleLocationMouseLeave);
			$.append($$anchor, button);
		};

		$.if(node_1, ($$render) => {
			if ($$props.story.location) $$render(consequent_1);
		});
	}

	$.reset(section);

	var node_4 = $.sibling(section, 2);

	{
		var consequent_2 = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_2();
					var div_2 = $.child(div_1);
					var node_5 = $.child(div_2);

					GlobePreview(node_5, {
						get lat() {
							return $.get(globeCoords).lat;
						},

						get lng() {
							return $.get(globeCoords).lng;
						},
						size: typeof window !== "undefined" && window.innerWidth >= 768 ? 220 : 160
					});

					$.reset(div_2);
					$.reset(div_1);
					$.bind_this(div_1, ($$value) => floating.elements.floating = $$value, () => floating?.elements?.floating);

					$.template_effect(() => {
						$.set_class(div_1, 1, `absolute top-0 left-0 z-tooltip overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg transition-opacity duration-200 dark:border-gray-600 dark:bg-gray-800 ${floating.isPositioned ? 'opacity-100' : 'opacity-0 invisible'}`);
						$.set_style(div_1, floating.floatingStyles);
					});

					$.event('mouseenter', div_1, handlePopupEnter);
					$.event('mouseleave', div_1, handlePopupLeave);
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_4, ($$render) => {
			if ($.get(showGlobe) && $.get(globeCoords) && floating) $$render(consequent_2);
		});
	}

	$.template_effect(() => div.dir = div.dir);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);