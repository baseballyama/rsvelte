import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import { useCitationProcessing } from '$lib/utils/citationProcessing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StoryDidYouKnow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			content,
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
		const displayContent = $.derived(() => {
			const processed = useCitationProcessing(content, citationMapping);

			// Ensure we return a string (content is always a string, but TypeScript needs assurance)
			return typeof processed === 'string' ? processed : processed.join(' ');
		});

		$$renderer.push(`<section class="mt-6 rounded-lg bg-[#CED8FB] p-4 dark:bg-[#2A3B5E]"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">${$.escape(storyLocalizer("section.didYouKnow") || "Did You Know?")}</h3> <p class="text-base text-gray-700 dark:text-gray-200">`);

		if (flashcardMode) {
			$$renderer.push('<!--[0-->');

			SelectableText($$renderer, {
				text: displayContent(),
				flashcardMode,
				selectedWords,
				shouldJiggle,
				onWordClick,
				section: 'did_you_know'
			});
		} else {
			$$renderer.push('<!--[-1-->');

			CitationText($$renderer, {
				text: displayContent(),
				inline: false,
				articles,
				citationMapping,
				storyLocalizer
			});
		}

		$$renderer.push(`<!--]--></p></section>`);
	});
}