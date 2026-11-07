import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<a target="_blank" rel="noopener noreferrer" class="underline text-black dark:text-white hover:text-[#183FDC] dark:hover:text-[#5B89FF] transition-colors focus-visible-ring rounded"><!></a>`);
var root_1 = $.from_html(`<span class="underline"><!></span>`);
var root_2 = $.from_html(`<span> </span>`);
var root_3 = $.from_html(`<p class="text-black dark:text-white text-sm"><!></p>`);
var root_4 = $.from_html(`<p class="mt-2 text-sm text-gray-600 dark:text-gray-400"> </p>`);
var root_5 = $.from_html(`<section class="my-8 rounded-lg bg-[#F3F6FE] p-4 dark:bg-gray-700"><blockquote class="text-base text-black dark:text-white mb-2 first-letter-capitalize"><span class="italic" aria-hidden="true">"</span><!><span class="italic" aria-hidden="true">"</span></blockquote> <!> <!></section>`);

export default function StoryQuote($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let articles = $.prop($$props, 'articles', 19, () => []),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

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
		const cleanedQuote = stripOuterQuotes($$props.quote);

		if (!$$props.citationMapping) return cleanedQuote;

		return replaceWithNumberedCitations(cleanedQuote, $$props.citationMapping);
	});

	var section = root_5();
	var blockquote = $.child(section);
	var node = $.sibling($.child(blockquote));

	{
		var consequent_1 = ($$anchor) => {
			var a = root();
			var node_1 = $.child(a);

			{
				var consequent = ($$anchor) => {
					SelectableText($$anchor, {
						get text() {
							return $.get(displayQuote);
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
						section: 'quote'
					});
				};

				var alternate = ($$anchor) => {
					CitationText($$anchor, {
						get text() {
							return $.get(displayQuote);
						},
						showFavicons: true,
						showNumbers: false,
						get articles() {
							return articles();
						},

						get citationMapping() {
							return $$props.citationMapping;
						}
					});
				};

				$.if(node_1, ($$render) => {
					if (flashcardMode()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(a);

			$.template_effect(() => {
				$.set_attribute(a, 'href', $$props.sourceUrl);
				$.set_attribute(a, 'aria-label', `Read full quote${$$props.author ? ` from ${$$props.author}` : ''}${$$props.attribution ? ` - ${$$props.attribution}` : ''} at ${$$props.sourceDomain || 'source'}`);
			});

			$.append($$anchor, a);
		};

		var alternate_2 = ($$anchor) => {
			var span = root_1();
			var node_2 = $.child(span);

			{
				var consequent_2 = ($$anchor) => {
					SelectableText($$anchor, {
						get text() {
							return $.get(displayQuote);
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
						section: 'quote'
					});
				};

				var alternate_1 = ($$anchor) => {
					CitationText($$anchor, {
						get text() {
							return $.get(displayQuote);
						},
						showFavicons: true,
						showNumbers: false,
						get articles() {
							return articles();
						},

						get citationMapping() {
							return $$props.citationMapping;
						}
					});
				};

				$.if(node_2, ($$render) => {
					if (flashcardMode()) $$render(consequent_2); else $$render(alternate_1, -1);
				});
			}

			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.sourceUrl) $$render(consequent_1); else $$render(alternate_2, -1);
		});
	}

	$.next();
	$.reset(blockquote);

	var node_3 = $.sibling(blockquote, 2);

	{
		var consequent_6 = ($$anchor) => {
			var p = root_3();
			var node_4 = $.child(p);

			{
				var consequent_3 = ($$anchor) => {
					var span_1 = root_2();
					var text_1 = $.only_child(span_1);

					$.template_effect(() => $.set_text(text_1, `${$$props.author ?? ''} - ${$$props.attribution ?? ''}`));
					$.append($$anchor, span_1);
				};

				var consequent_4 = ($$anchor) => {
					var span_2 = root_2();
					var text_2 = $.only_child(span_2, true);

					$.template_effect(() => $.set_text(text_2, $$props.attribution));
					$.append($$anchor, span_2);
				};

				var consequent_5 = ($$anchor) => {
					var span_3 = root_2();
					var text_3 = $.only_child(span_3, true);

					$.template_effect(() => $.set_text(text_3, $$props.author));
					$.append($$anchor, span_3);
				};

				$.if(node_4, ($$render) => {
					if ($$props.author && $$props.attribution) $$render(consequent_3); else if ($$props.attribution) $$render(consequent_4, 1); else if ($$props.author) $$render(consequent_5, 2);
				});
			}

			$.reset(p);
			$.append($$anchor, p);
		};

		$.if(node_3, ($$render) => {
			if ($$props.author || $$props.attribution) $$render(consequent_6);
		});
	}

	var node_5 = $.sibling(node_3, 2);

	{
		var consequent_7 = ($$anchor) => {
			var p_1 = root_4();
			var text_4 = $.only_child(p_1);

			$.template_effect(() => $.set_text(text_4, `(via ${$$props.sourceDomain ?? ''})`));
			$.append($$anchor, p_1);
		};

		$.if(node_5, ($$render) => {
			if ($$props.sourceDomain && !$$props.sourceUrl) $$render(consequent_7);
		});
	}

	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}