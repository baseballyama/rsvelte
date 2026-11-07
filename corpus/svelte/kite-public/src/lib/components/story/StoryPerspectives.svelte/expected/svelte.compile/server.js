import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { parseStructuredText } from '$lib/utils/textParsing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StoryPerspectives($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			perspectives = [],
			articles = [],
			citationMapping,
			storyLocalizer = s,
			flashcardMode = false,
			selectedWords = new Set(),
			shouldJiggle = false,
			onWordClick
		} = $$props;

		// Convert citations in perspectives if mapping is available
		const displayPerspectives = $.derived(() => {
			if (!citationMapping) return perspectives;

			return perspectives.map((p) => ({
				...p,
				text: replaceWithNumberedCitations(p.text, citationMapping)
			}));
		});

		// Helper function to detect if text contains citations
		function hasCitations(text) {
			if (!text) return false;

			// Match citations like [domain#position], [common], [1], [2], etc.
			const citationPattern = /\[([^\]]+)\]/g;

			return citationPattern.test(text);
		}

		// Touch handling for mobile
		let isScrolling = false;

		function handleTouchStart() {
			isScrolling = true;
		}

		function handleTouchEnd() {
			setTimeout(
				() => {
					isScrolling = false;
				},
				50
			);
		}

		const scrollFadeDuration = 150;

		// Scroll indicator state
		let scrollContainer = null;

		let canScrollLeft = false;
		let canScrollRight = false;

		function checkScrollability() {
			if (!scrollContainer) return;

			const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;

			canScrollLeft = scrollLeft > 10;
			canScrollRight = scrollWidth - scrollLeft - clientWidth > 10;
		}

		function scrollBy(direction) {
			if (!scrollContainer) return;

			// Get the actual card width + gap from the first card
			const firstCard = scrollContainer.querySelector(':scope > div');

			if (!firstCard) return;

			const cardWidth = firstCard.offsetWidth;
			const gap = 12; // gap-3 = 0.75rem = 12px
			const scrollAmount = cardWidth + gap;

			scrollContainer.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth'
			});
		}

		$$renderer.push(`<section class="mt-6"><h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">${$.escape(
			// Also check on resize
			storyLocalizer("section.perspectives") || "Perspectives"
		)}</h3> <div class="relative overflow-x-hidden"><div class="horizontal-scroll-container flex flex-row gap-3 overflow-x-scroll pb-4" role="region"${$.attr('aria-label', storyLocalizer("section.perspectives.carousel") || "Perspectives carousel - use arrow keys or swipe to navigate")}><!--[-->`);

		const each_array = $.ensure_array_like(displayPerspectives());

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let perspective = each_array[$$index_1];
			const parsed = parseStructuredText(perspective.text);

			$$renderer.push(`<div class="w-52 shrink-0 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">`);

			if (parsed.hasTitle) {
				$$renderer.push('<!--[0-->');

				const titleCitations = getCitedArticlesForText(parsed.title, citationMapping, articles);
				const contentCitations = getCitedArticlesForText(parsed.content, citationMapping, articles);

				$$renderer.push(`<p class="mb-2 text-base font-bold text-gray-800 dark:text-gray-200 break-words" dir="auto">`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: parsed.title,
						flashcardMode,
						selectedWords,
						shouldJiggle,
						onWordClick,
						section: 'perspectives'
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: parsed.title,
						showFavicons: false,
						showNumbers: false,
						inline: true,
						articles: titleCitations.citedArticles,
						citationMapping,
						storyLocalizer
					});
				}

				$$renderer.push(`<!--]--></p> <p class="mb-2 text-base text-gray-700 dark:text-gray-300" dir="auto">`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: parsed.content,
						flashcardMode,
						selectedWords,
						shouldJiggle,
						onWordClick,
						section: 'perspectives'
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: parsed.content,
						showFavicons: false,
						showNumbers: false,
						inline: true,
						articles: contentCitations.citedArticles,
						citationMapping,
						storyLocalizer
					});
				}

				$$renderer.push(`<!--]--></p>`);
			} else {
				$$renderer.push('<!--[-1-->');

				const contentCitations = getCitedArticlesForText(parsed.content, citationMapping, articles);

				$$renderer.push(`<p class="mb-2 text-base text-gray-700 dark:text-gray-300" dir="auto">`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: parsed.content,
						flashcardMode,
						selectedWords,
						shouldJiggle,
						onWordClick,
						section: 'perspectives'
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: parsed.content,
						showFavicons: false,
						showNumbers: false,
						inline: true,
						articles: contentCitations.citedArticles,
						citationMapping,
						storyLocalizer
					});
				}

				$$renderer.push(`<!--]--></p>`);
			}

			$$renderer.push(`<!--]--> `);

			if (perspective.sources && perspective.sources.length > 0 && !hasCitations(perspective.text)) {
				$$renderer.push(`<!--[0--><div class="mt-2 text-sm text-gray-600 dark:text-gray-400"><!--[-->`);

				const each_array_1 = $.ensure_array_like(perspective.sources);

				for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
					let source = each_array_1[idx];

					$$renderer.push(`<a${$.attr('href', source.url)} target="_blank" rel="noopener noreferrer" class="text-[#183FDC] hover:underline dark:text-[#5B89FF]" dir="auto">${$.escape(source.name)}</a> `);

					if (idx < perspective.sources.length - 1) {
						$$renderer.push(`<!--[0--><span>•</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (canScrollLeft) {
			$$renderer.push(`<!--[0--><div class="pointer-events-none absolute left-0 top-0 h-full w-8 bg-linear-to-r from-white to-transparent dark:from-gray-900 md:hidden" aria-hidden="true"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (canScrollLeft) {
			$$renderer.push(`<!--[0--><button class="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 transition-opacity" aria-label="Scroll left"><svg class="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (canScrollRight) {
			$$renderer.push(`<!--[0--><button class="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 transition-opacity" aria-label="Scroll right"><svg class="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (canScrollRight) {
			$$renderer.push(`<!--[0--><div class="pointer-events-none absolute right-0 top-0 h-full w-8 bg-linear-to-l from-white to-transparent dark:from-gray-900 md:hidden" aria-hidden="true"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></section>`);
	});
}