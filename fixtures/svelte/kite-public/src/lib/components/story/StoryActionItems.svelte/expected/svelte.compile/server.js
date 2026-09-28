import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StoryActionItems($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			actionItems,
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
		const displayItems = $.derived(() => {
			if (!citationMapping) return actionItems;

			return actionItems.map((item) => replaceWithNumberedCitations(item, citationMapping));
		});

		$$renderer.push(`<section class="mt-6 rounded-lg bg-[#F1FAE8] p-4 dark:bg-[#2B411C]"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">${$.escape(storyLocalizer("section.actionItems") || "Action Items")}</h3> <ul class="mb-2 ms-4 list-disc space-y-2 text-gray-700 dark:text-gray-200"><!--[-->`);

		const each_array = $.ensure_array_like(displayItems());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			const itemCitations = getCitedArticlesForText(item, citationMapping, articles);

			$$renderer.push(`<li dir="auto">`);

			if (flashcardMode) {
				$$renderer.push('<!--[0-->');

				SelectableText($$renderer, {
					text: item,
					flashcardMode,
					selectedWords,
					selectedPhrases,
					shouldJiggle,
					onWordClick,
					section: 'user_action_items'
				});
			} else {
				$$renderer.push('<!--[-1-->');

				CitationText($$renderer, {
					text: item,
					showFavicons: false,
					showNumbers: false,
					inline: true,
					articles: itemCitations.citedArticles,
					citationMapping,
					storyLocalizer
				});
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ul></section>`);
	});
}