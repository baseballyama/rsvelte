import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { parseStructuredText } from '$lib/utils/textParsing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<h4 class="font-semibold text-gray-800 dark:text-gray-200"> </h4> <p class="text-base text-gray-700 dark:text-gray-300" dir="auto"><!></p>`, 1);
var root_1 = $.from_html(`<p class="text-base text-gray-700 dark:text-gray-300" dir="auto"><!></p>`);
var root_2 = $.from_html(`<article class="rounded-lg bg-gray-100 p-4 dark:bg-gray-700"><!></article>`);
var root_3 = $.from_html(`<section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <div class="space-y-2"></div></section>`);

export default function StoryInternationalReactions($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let articles = $.prop($$props, 'articles', 19, () => []),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Convert citations in reactions if mapping is available
	const displayReactions = $.derived(() => {
		if (!$$props.citationMapping) return $$props.reactions;

		return $$props.reactions.map((r) => replaceWithNumberedCitations(r, $$props.citationMapping));
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

	var section = root_3();
	var h3 = $.child(section);
	var text = $.only_child(h3, true);
	var div = $.sibling(h3, 2);

	$.each(div, 21, () => $.get(displayReactions), $.index, ($$anchor, reaction) => {
		const parsedReaction = $.derived(() => parseReaction($.get(reaction)));
		const responseCitations = $.derived(() => getCitedArticlesForText($.get(parsedReaction).response, $$props.citationMapping, articles()));
		var article = root_2();
		var node = $.child(article);

		{
			var consequent_1 = ($$anchor) => {
				var fragment = root();
				var h4 = $.first_child(fragment);
				var text_1 = $.only_child(h4, true);
				var p = $.sibling(h4, 2);
				var node_1 = $.child(p);

				{
					var consequent = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(parsedReaction).response;
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
							section: 'international_reactions'
						});
					};

					var alternate = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(parsedReaction).response;
							},
							showFavicons: false,
							showNumbers: false,
							inline: true,
							get articles() {
								return $.get(responseCitations).citedArticles;
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
						if (flashcardMode()) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(p);

				$.template_effect(() => {
					$.set_text(text_1, $.get(parsedReaction).country);
					p.dir = p.dir;
				});

				$.append($$anchor, fragment);
			};

			var alternate_2 = ($$anchor) => {
				var p_1 = root_1();
				var node_2 = $.child(p_1);

				{
					var consequent_2 = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(parsedReaction).response;
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
							section: 'international_reactions'
						});
					};

					var alternate_1 = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(parsedReaction).response;
							},
							showFavicons: false,
							showNumbers: false,
							inline: true,
							get articles() {
								return $.get(responseCitations).citedArticles;
							},

							get citationMapping() {
								return $$props.citationMapping;
							},

							get storyLocalizer() {
								return storyLocalizer();
							}
						});
					};

					$.if(node_2, ($$render) => {
						if (flashcardMode()) $$render(consequent_2); else $$render(alternate_1, -1);
					});
				}

				$.reset(p_1);
				$.template_effect(() => p_1.dir = p_1.dir);
				$.append($$anchor, p_1);
			};

			$.if(node, ($$render) => {
				if ($.get(parsedReaction).country) $$render(consequent_1); else $$render(alternate_2, -1);
			});
		}

		$.reset(article);
		$.append($$anchor, article);
	});

	$.reset(div);
	$.reset(section);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => storyLocalizer()("section.internationalReactions") || "International Reactions"
	]);

	$.append($$anchor, section);
	$.pop();
}