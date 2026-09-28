import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { parseStructuredText } from '$lib/utils/textParsing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StoryHighlights($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			points = [],
			articles = [],
			citationMapping,
			storyLocalizer = s,
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick
		} = $$props;

		// Convert citations to numbered format if mapping is available
		const displayPoints = $.derived(() => {
			const filteredPoints = points.filter((point) => typeof point === 'string' && point.trim().length > 0);

			if (!citationMapping) return filteredPoints;

			return filteredPoints.map((point) => replaceWithNumberedCitations(point, citationMapping));
		});

		$$renderer.push(`<section class="mt-6"><h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">${$.escape(storyLocalizer("section.highlights") || "Key Points")}</h3> <ol class="border-t border-dashed border-gray-300 dark:border-gray-600" role="list" aria-label="Key highlights"><!--[-->`);

		const each_array = $.ensure_array_like(displayPoints());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let point = each_array[index];
			const parsed = parseStructuredText(point);

			$$renderer.push(`<li class="relative border-b border-dashed border-gray-300 py-4 ps-10 dark:border-gray-600" role="listitem"${$.attr('aria-setsize', displayPoints().length)}${$.attr('aria-posinset', index + 1)}><div class="absolute top-4 start-0" aria-hidden="true"><div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#F9D9B8]"><span class="text-sm font-semibold text-gray-800">${$.escape(index + 1)}</span></div></div> `);

			if (parsed.hasTitle) {
				$$renderer.push('<!--[0-->');

				const titleCitations = getCitedArticlesForText(parsed.title, citationMapping, articles);
				const contentCitations = getCitedArticlesForText(parsed.content, citationMapping, articles);

				$$renderer.push(`<div><h4 class="mb-2 font-semibold text-gray-800 dark:text-gray-200" dir="auto">`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: parsed.title,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'talking_points'
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: parsed.title,
						articles: titleCitations.citedArticles,
						citationMapping,
						storyLocalizer
					});
				}

				$$renderer.push(`<!--]--></h4> <p class="-ms-10 text-gray-700 dark:text-gray-300 first-letter-capitalize" dir="auto">`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: parsed.content,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'talking_points'
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: parsed.content,
						articles: contentCitations.citedArticles,
						citationMapping,
						storyLocalizer
					});
				}

				$$renderer.push(`<!--]--></p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				const contentCitations = getCitedArticlesForText(parsed.content, citationMapping, articles);

				$$renderer.push(`<p class="text-base text-gray-700 dark:text-gray-300 first-letter-capitalize" dir="auto">`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: parsed.content,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'talking_points'
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: parsed.content,
						articles: contentCitations.citedArticles,
						citationMapping,
						storyLocalizer
					});
				}

				$$renderer.push(`<!--]--></p>`);
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ol></section>`);
	});
}