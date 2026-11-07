import * as $ from 'svelte/internal/server';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StoryListSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		// Section identifier for context
		let {
			title,
			items = [],
			showAsList = true,
			articles = [],
			citationMapping,
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick,
			section
		} = $$props;

		// Convert citations to numbered format if mapping is available
		const displayItems = $.derived(() => {
			if (!citationMapping) return items;

			return items.map((item) => replaceWithNumberedCitations(item, citationMapping));
		});

		$$renderer.push(`<section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">${$.escape(title)}</h3> `);

		if (showAsList) {
			$$renderer.push(`<!--[0--><ul class="mb-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300"><!--[-->`);

			const each_array = $.ensure_array_like(displayItems());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];
				const itemCitations = getCitedArticlesForText(item, citationMapping, articles);

				$$renderer.push(`<li>`);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: item,
						flashcardMode,
						selectedWords,
						selectedPhrases,
						shouldJiggle,
						onWordClick,
						section
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: item,
						showFavicons: false,
						showNumbers: false,
						inline: true,
						articles: itemCitations.citedArticles,
						citationMapping
					});
				}

				$$renderer.push(`<!--]--></li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="mb-4 space-y-2 text-base text-gray-700 dark:text-gray-300"><!--[-->`);

			const each_array_1 = $.ensure_array_like(displayItems());

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let item = each_array_1[$$index_1];
				const itemCitations = getCitedArticlesForText(item, citationMapping, articles);

				if (flashcardMode) {
					$$renderer.push('<!--[0-->');

					SelectableText($$renderer, {
						text: item,
						flashcardMode,
						selectedWords,
						shouldJiggle,
						onWordClick,
						section
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CitationText($$renderer, {
						text: item,
						showFavicons: false,
						showNumbers: false,
						inline: false,
						articles: itemCitations.citedArticles,
						citationMapping
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></section>`);
	});
}