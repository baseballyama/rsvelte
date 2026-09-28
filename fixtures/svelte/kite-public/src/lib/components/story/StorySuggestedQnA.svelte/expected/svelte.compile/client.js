import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<div class="rounded-lg bg-gray-100 p-4 dark:bg-gray-700"><p class="mb-2 text-base font-semibold text-gray-800 dark:text-gray-200"><!></p> <p class="text-base text-gray-700 dark:text-gray-300"><!></p></div>`);
var root_1 = $.from_html(`<section class="mt-6"><h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <div class="space-y-4"></div></section>`);

export default function StorySuggestedQnA($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let articles = $.prop($$props, 'articles', 19, () => []),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Convert citations in Q&A if mapping is available
	const displayQna = $.derived(() => {
		if (!$$props.citationMapping) return $$props.qna;

		return $$props.qna.map((qa) => ({
			question: replaceWithNumberedCitations(qa.question, $$props.citationMapping),
			answer: replaceWithNumberedCitations(qa.answer, $$props.citationMapping)
		}));
	});

	var section = root_1();
	var h3 = $.child(section);
	var text = $.only_child(h3, true);
	var div = $.sibling(h3, 2);

	$.each(div, 21, () => $.get(displayQna), $.index, ($$anchor, qa) => {
		const questionCitations = $.derived(() => getCitedArticlesForText($.get(qa).question, $$props.citationMapping, articles()));
		const answerCitations = $.derived(() => getCitedArticlesForText($.get(qa).answer, $$props.citationMapping, articles()));
		var div_1 = root();
		var p = $.child(div_1);
		var node = $.child(p);

		{
			var consequent = ($$anchor) => {
				SelectableText($$anchor, {
					get text() {
						return $.get(qa).question;
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
					section: 'suggested_qna'
				});
			};

			var alternate = ($$anchor) => {
				CitationText($$anchor, {
					get text() {
						return $.get(qa).question;
					},
					showFavicons: false,
					showNumbers: false,
					inline: true,
					get articles() {
						return $.get(questionCitations).citedArticles;
					},

					get citationMapping() {
						return $$props.citationMapping;
					},

					get storyLocalizer() {
						return storyLocalizer();
					}
				});
			};

			$.if(node, ($$render) => {
				if (flashcardMode()) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(p);

		var p_1 = $.sibling(p, 2);
		var node_1 = $.child(p_1);

		{
			var consequent_1 = ($$anchor) => {
				SelectableText($$anchor, {
					get text() {
						return $.get(qa).answer;
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
					section: 'suggested_qna'
				});
			};

			var alternate_1 = ($$anchor) => {
				CitationText($$anchor, {
					get text() {
						return $.get(qa).answer;
					},
					showFavicons: false,
					showNumbers: false,
					inline: false,
					get articles() {
						return $.get(answerCitations).citedArticles;
					},

					get citationMapping() {
						return $$props.citationMapping;
					},

					get storyLocalizer() {
						return storyLocalizer();
					}
				});
			};

			$.if(node_1, ($$render) => {
				if (flashcardMode()) $$render(consequent_1); else $$render(alternate_1, -1);
			});
		}

		$.reset(p_1);
		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.reset(section);
	$.template_effect(($0) => $.set_text(text, $0), [() => storyLocalizer()("section.suggestedQnA") || "Q&A"]);
	$.append($$anchor, section);
	$.pop();
}