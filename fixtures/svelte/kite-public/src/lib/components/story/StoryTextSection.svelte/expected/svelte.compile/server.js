import * as $ from 'svelte/internal/server';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StoryTextSection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		// Section identifier for context
		let {
			title,
			content,
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
		const displayContent = $.derived(() => {
			if (!citationMapping) return content;

			return replaceWithNumberedCitations(content, citationMapping);
		});

		$$renderer.push(`<section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">${$.escape(title)}</h3> <div class="mb-4 text-base text-gray-700 dark:text-gray-300">`);

		if (flashcardMode) {
			$$renderer.push('<!--[0-->');

			SelectableText($$renderer, {
				text: displayContent(),
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
				text: displayContent(),
				showFavicons: false,
				showNumbers: false,
				articles,
				citationMapping
			});
		}

		$$renderer.push(`<!--]--></div></section>`);
	});
}