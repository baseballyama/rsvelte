import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StoryQuote($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			quote,
			author,
			attribution,
			sourceUrl,
			sourceDomain,
			articles = [],
			citationMapping,
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick
		} = $$props;

		// Helper function to strip outer quotes
		function stripOuterQuotes(text) {
			if (!text) return text;

			let trimmed = text.trim();

			// Check for various quote characters: straight double, straight single, and curly quotes
			const quoteChars = ['"', "'", '\u201C', '\u201D', '\u2018', '\u2019'];

			// Remove leading quotes (including multiple consecutive quotes)
			while (trimmed.length > 0 && quoteChars.includes(trimmed[0])) {
				trimmed = trimmed.slice(1);
			}

			// Trim spaces after removing leading quotes
			trimmed = trimmed.trimStart();

			// Trim trailing spaces before checking for trailing quotes
			trimmed = trimmed.trimEnd();

			// Remove trailing quotes (including multiple consecutive quotes)
			while (trimmed.length > 0 && quoteChars.includes(trimmed[trimmed.length - 1])) {
				trimmed = trimmed.slice(0, -1);
			}

			// Final trim to remove any remaining spaces
			return trimmed.trim();
		}

		// Convert citations to numbered format if mapping is available
		const displayQuote = $.derived(() => {
			const cleanedQuote = stripOuterQuotes(quote);

			if (!citationMapping) return cleanedQuote;

			return replaceWithNumberedCitations(cleanedQuote, citationMapping);
		});

		$$renderer.push(`<section class="my-8 rounded-lg bg-[#F3F6FE] p-4 dark:bg-gray-700"><blockquote class="text-base text-black dark:text-white mb-2 first-letter-capitalize"><span class="italic" aria-hidden="true">"</span>`);

		if (sourceUrl) {
			$$renderer.push(`<!--[0--><a${$.attr('href', sourceUrl)} target="_blank" rel="noopener noreferrer"${$.attr('aria-label', `Read full quote${author ? ` from ${author}` : ''}${attribution ? ` - ${attribution}` : ''} at ${sourceDomain || 'source'}`)} class="underline text-black dark:text-white hover:text-[#183FDC] dark:hover:text-[#5B89FF] transition-colors focus-visible-ring rounded">`);

			if (flashcardMode) {
				$$renderer.push('<!--[0-->');

				SelectableText($$renderer, {
					text: displayQuote(),
					flashcardMode,
					selectedWords,
					selectedPhrases,
					shouldJiggle,
					onWordClick,
					section: 'quote'
				});
			} else {
				$$renderer.push('<!--[-1-->');

				CitationText($$renderer, {
					text: displayQuote(),
					showFavicons: true,
					showNumbers: false,
					articles,
					citationMapping
				});
			}

			$$renderer.push(`<!--]--></a>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="underline">`);

			if (flashcardMode) {
				$$renderer.push('<!--[0-->');

				SelectableText($$renderer, {
					text: displayQuote(),
					flashcardMode,
					selectedWords,
					selectedPhrases,
					shouldJiggle,
					onWordClick,
					section: 'quote'
				});
			} else {
				$$renderer.push('<!--[-1-->');

				CitationText($$renderer, {
					text: displayQuote(),
					showFavicons: true,
					showNumbers: false,
					articles,
					citationMapping
				});
			}

			$$renderer.push(`<!--]--></span>`);
		}

		$$renderer.push(`<!--]--><span class="italic" aria-hidden="true">"</span></blockquote> `);

		if (author || attribution) {
			$$renderer.push(`<!--[0--><p class="text-black dark:text-white text-sm">`);

			if (author && attribution) {
				$$renderer.push(`<!--[0--><span>${$.escape(author)} - ${$.escape(attribution)}</span>`);
			} else if (attribution) {
				$$renderer.push(`<!--[1--><span>${$.escape(attribution)}</span>`);
			} else if (author) {
				$$renderer.push(`<!--[2--><span>${$.escape(author)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (sourceDomain && !sourceUrl) {
			$$renderer.push(`<!--[0--><p class="mt-2 text-sm text-gray-600 dark:text-gray-400">(via ${$.escape(sourceDomain)})</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section>`);
	});
}