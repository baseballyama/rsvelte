import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { parseStructuredText } from '$lib/utils/textParsing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<div><h4 class="mb-2 font-semibold text-gray-800 dark:text-gray-200" dir="auto"><!></h4> <p class="-ms-10 text-gray-700 dark:text-gray-300 first-letter-capitalize" dir="auto"><!></p></div>`);
var root_1 = $.from_html(`<p class="text-base text-gray-700 dark:text-gray-300 first-letter-capitalize" dir="auto"><!></p>`);
var root_2 = $.from_html(`<li class="relative border-b border-dashed border-gray-300 py-4 ps-10 dark:border-gray-600" role="listitem"><div class="absolute top-4 start-0" aria-hidden="true"><div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#F9D9B8]"><span class="text-sm font-semibold text-gray-800"></span></div></div> <!></li>`);
var root_3 = $.from_html(`<section class="mt-6"><h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <ol class="border-t border-dashed border-gray-300 dark:border-gray-600" role="list" aria-label="Key highlights"></ol></section>`);

export default function StoryHighlights($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let points = $.prop($$props, 'points', 19, () => []),
		articles = $.prop($$props, 'articles', 19, () => []),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Convert citations to numbered format if mapping is available
	const displayPoints = $.derived(() => {
		const filteredPoints = points().filter((point) => typeof point === 'string' && point.trim().length > 0);

		if (!$$props.citationMapping) return filteredPoints;

		return filteredPoints.map((point) => replaceWithNumberedCitations(point, $$props.citationMapping));
	});

	var section = root_3();
	var h3 = $.child(section);
	var text = $.only_child(h3, true);
	var ol = $.sibling(h3, 2);

	$.each(ol, 21, () => $.get(displayPoints), $.index, ($$anchor, point, index) => {
		const parsed = $.derived(() => parseStructuredText($.get(point)));
		var li = root_2();

		$.set_attribute(li, 'aria-posinset', index + 1);

		var div = $.child(li);
		var div_1 = $.child(div);
		var span = $.child(div_1);

		span.textContent = index + 1;
		$.reset(div_1);
		$.reset(div);

		var node = $.sibling(div, 2);

		{
			var consequent_2 = ($$anchor) => {
				const titleCitations = $.derived(() => getCitedArticlesForText($.get(parsed).title, $$props.citationMapping, articles()));
				const contentCitations = $.derived(() => getCitedArticlesForText($.get(parsed).content, $$props.citationMapping, articles()));
				var div_2 = root();
				var h4 = $.child(div_2);
				var node_1 = $.child(h4);

				{
					var consequent = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(parsed).title;
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
							section: 'talking_points'
						});
					};

					var alternate = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(parsed).title;
							},

							get articles() {
								return $.get(titleCitations).citedArticles;
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

				$.reset(h4);

				var p = $.sibling(h4, 2);
				var node_2 = $.child(p);

				{
					var consequent_1 = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(parsed).content;
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
							section: 'talking_points'
						});
					};

					var alternate_1 = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(parsed).content;
							},

							get articles() {
								return $.get(contentCitations).citedArticles;
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
						if (flashcardMode()) $$render(consequent_1); else $$render(alternate_1, -1);
					});
				}

				$.reset(p);
				$.reset(div_2);

				$.template_effect(() => {
					h4.dir = h4.dir;
					p.dir = p.dir;
				});

				$.append($$anchor, div_2);
			};

			var alternate_3 = ($$anchor) => {
				const contentCitations = $.derived(() => getCitedArticlesForText($.get(parsed).content, $$props.citationMapping, articles()));
				var p_1 = root_1();
				var node_3 = $.child(p_1);

				{
					var consequent_3 = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(parsed).content;
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
							section: 'talking_points'
						});
					};

					var alternate_2 = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(parsed).content;
							},

							get articles() {
								return $.get(contentCitations).citedArticles;
							},

							get citationMapping() {
								return $$props.citationMapping;
							},

							get storyLocalizer() {
								return storyLocalizer();
							}
						});
					};

					$.if(node_3, ($$render) => {
						if (flashcardMode()) $$render(consequent_3); else $$render(alternate_2, -1);
					});
				}

				$.reset(p_1);
				$.template_effect(() => p_1.dir = p_1.dir);
				$.append($$anchor, p_1);
			};

			$.if(node, ($$render) => {
				if ($.get(parsed).hasTitle) $$render(consequent_2); else $$render(alternate_3, -1);
			});
		}

		$.reset(li);
		$.template_effect(() => $.set_attribute(li, 'aria-setsize', $.get(displayPoints).length));
		$.append($$anchor, li);
	});

	$.reset(ol);
	$.reset(section);
	$.template_effect(($0) => $.set_text(text, $0), [() => storyLocalizer()("section.highlights") || "Key Points"]);
	$.append($$anchor, section);
	$.pop();
}