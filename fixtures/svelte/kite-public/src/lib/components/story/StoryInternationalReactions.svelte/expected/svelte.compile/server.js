import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { parseStructuredText } from '$lib/utils/textParsing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StoryInternationalReactions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			reactions,
			articles = [],
			citationMapping,
			storyLocalizer = s,
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick
		} = $$props;

		// Convert citations in reactions if mapping is available
		const displayReactions = $.derived(() => {
			if (!citationMapping) return reactions;

			return reactions.map((r) => replaceWithNumberedCitations(r, citationMapping));
		});

		// Parse reaction text using structured text utility
		function parseReaction(reaction) {
			const parsed = parseStructuredText(reaction);
			let country = parsed.hasTitle ? parsed.title : '';
			let response = parsed.content;

			// Ensure response ends with period
			if (!response.endsWith('.')) {
				response += '.';
			}

			return { country, response };
		}

		$$renderer.push(`<section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">${$.escape(storyLocalizer("section.internationalReactions") || "International Reactions")}</h3> <div class="space-y-2"><!--[-->`);

		const each_array = $.ensure_array_like(displayReactions());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let reaction = each_array[$$index];
			const parsedReaction = parseReaction(reaction);
			const responseCitations = getCitedArticlesForText(parsedReaction.response, citationMapping, articles);

			$$renderer.push(`<article class="rounded-lg bg-gray-100 p-4 dark:bg-gray-700">`);

			if (parsedReaction.country) {
				$$renderer.push(`<!--[0--><h4 class="font-semibold text-gray-800 dark:text-gray-200">${$.escape(parsedReaction.country)}</h4> <p class="text-base text-gray-700 dark:text-gray-300" dir="auto">`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: parsedReaction.response,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'international_reactions'
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: parsedReaction.response,
						showFavicons: false,
						showNumbers: false,
						inline: true,
						articles: responseCitations.citedArticles,
						citationMapping,
						storyLocalizer
					});
				}

				$$renderer.push(`<!--]--></p>`);
			} else {
				$$renderer.push(`<!--[-1--><p class="text-base text-gray-700 dark:text-gray-300" dir="auto">`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: parsedReaction.response,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section: 'international_reactions'
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: parsedReaction.response,
						showFavicons: false,
						showNumbers: false,
						inline: true,
						articles: responseCitations.citedArticles,
						citationMapping,
						storyLocalizer
					});
				}

				$$renderer.push(`<!--]--></p>`);
			}

			$$renderer.push(`<!--]--></article>`);
		}

		$$renderer.push(`<!--]--></div></section>`);
	});
}