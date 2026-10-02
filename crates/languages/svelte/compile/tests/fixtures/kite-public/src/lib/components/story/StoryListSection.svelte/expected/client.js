import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<li><!></li>`);
var root_1 = $.from_html(`<ul class="mb-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300"></ul>`);
var root_2 = $.from_html(`<div class="mb-4 space-y-2 text-base text-gray-700 dark:text-gray-300"></div>`);
var root_3 = $.from_html(`<section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <!></section>`);

export default function StoryListSection($$anchor, $$props) {
	$.push($$props, true);

	// Props
	// Section identifier for context
	let items = $.prop($$props, 'items', 19, () => []),
		showAsList = $.prop($$props, 'showAsList', 3, true),
		articles = $.prop($$props, 'articles', 19, () => []),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Convert citations to numbered format if mapping is available
	const displayItems = $.derived(() => {
		if (!$$props.citationMapping) return items();

		return items().map((item) => replaceWithNumberedCitations(item, $$props.citationMapping));
	});

	var section_1 = root_3();
	var h3 = $.child(section_1);
	var text = $.only_child(h3, true);
	var node = $.sibling(h3, 2);

	{
		var consequent_1 = ($$anchor) => {
			var ul = root_1();

			$.each(ul, 21, () => $.get(displayItems), $.index, ($$anchor, item) => {
				const itemCitations = $.derived(() => getCitedArticlesForText($.get(item), $$props.citationMapping, articles()));
				var li = root();
				var node_1 = $.child(li);

				{
					var consequent = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(item);
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

							get section() {
								return $$props.section;
							}
						});
					};

					var alternate = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(item);
							},
							showFavicons: false,
							showNumbers: false,
							inline: true,
							get articles() {
								return $.get(itemCitations).citedArticles;
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

				$.reset(li);
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.append($$anchor, ul);
		};

		var alternate_2 = ($$anchor) => {
			var div = root_2();

			$.each(div, 21, () => $.get(displayItems), $.index, ($$anchor, item) => {
				const itemCitations = $.derived(() => getCitedArticlesForText($.get(item), $$props.citationMapping, articles()));
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent_2 = ($$anchor) => {
						SelectableText($$anchor, {
							get text() {
								return $.get(item);
							},

							get flashcardMode() {
								return flashcardMode();
							},

							get selectedWords() {
								return selectedWords();
							},

							get shouldJiggle() {
								return shouldJiggle();
							},

							get onWordClick() {
								return $$props.onWordClick;
							},

							get section() {
								return $$props.section;
							}
						});
					};

					var alternate_1 = ($$anchor) => {
						CitationText($$anchor, {
							get text() {
								return $.get(item);
							},
							showFavicons: false,
							showNumbers: false,
							inline: false,
							get articles() {
								return $.get(itemCitations).citedArticles;
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

				$.append($$anchor, fragment_2);
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (showAsList()) $$render(consequent_1); else $$render(alternate_2, -1);
		});
	}

	$.reset(section_1);
	$.template_effect(() => $.set_text(text, $$props.title));
	$.append($$anchor, section_1);
	$.pop();
}