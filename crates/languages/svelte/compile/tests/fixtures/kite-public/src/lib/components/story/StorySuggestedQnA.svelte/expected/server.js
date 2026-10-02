import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StorySuggestedQnA($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			qna,
			articles = [],
			citationMapping,
			storyLocalizer = s,
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick
		} = $$props;

		// Convert citations in Q&A if mapping is available
		const displayQna = $.derived(() => {
			if (!citationMapping) return qna;

			return qna.map((qa) => ({
				question: replaceWithNumberedCitations(qa.question, citationMapping),
				answer: replaceWithNumberedCitations(qa.answer, citationMapping)
			}));
		});

		$$renderer.push(`<section class="mt-6"><h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200">${$.escape(storyLocalizer("section.suggestedQnA") || "Q&A")}</h3> <div class="space-y-4"><!--[-->`);

		const each_array = $.ensure_array_like(displayQna());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let qa = each_array[$$index];
			const questionCitations = getCitedArticlesForText(qa.question, citationMapping, articles);
			const answerCitations = getCitedArticlesForText(qa.answer, citationMapping, articles);

			$$renderer.push(`<div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-700"><p class="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">`);

			if (flashcardMode) {
				$$renderer.push('<!--[0-->');

				SelectableText($$renderer, {
					text: qa.question,
					flashcardMode,
					selectedWords,
					selectedPhrases,
					shouldJiggle,
					onWordClick,
					section: 'suggested_qna'
				});
			} else {
				$$renderer.push('<!--[-1-->');

				CitationText($$renderer, {
					text: qa.question,
					showFavicons: false,
					showNumbers: false,
					inline: true,
					articles: questionCitations.citedArticles,
					citationMapping,
					storyLocalizer
				});
			}

			$$renderer.push(`<!--]--></p> <p class="text-base text-gray-700 dark:text-gray-300">`);

			if (flashcardMode) {
				$$renderer.push('<!--[0-->');

				SelectableText($$renderer, {
					text: qa.answer,
					flashcardMode,
					selectedWords,
					selectedPhrases,
					shouldJiggle,
					onWordClick,
					section: 'suggested_qna'
				});
			} else {
				$$renderer.push('<!--[-1-->');

				CitationText($$renderer, {
					text: qa.answer,
					showFavicons: false,
					showNumbers: false,
					inline: false,
					articles: answerCitations.citedArticles,
					citationMapping,
					storyLocalizer
				});
			}

			$$renderer.push(`<!--]--></p></div>`);
		}

		$$renderer.push(`<!--]--></div></section>`);
	});
}