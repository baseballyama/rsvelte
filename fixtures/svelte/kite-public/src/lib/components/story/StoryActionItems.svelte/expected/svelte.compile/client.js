import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<li dir="auto"><!></li>`);
var root_1 = $.from_html(`<section class="mt-6 rounded-lg bg-[#F1FAE8] p-4 dark:bg-[#2B411C]"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100"> </h3> <ul class="mb-2 ms-4 list-disc space-y-2 text-gray-700 dark:text-gray-200"></ul></section>`);

export default function StoryActionItems($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let articles = $.prop($$props, 'articles', 19, () => []),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Convert citations to numbered format if mapping is available
	const displayItems = $.derived(() => {
		if (!$$props.citationMapping) return $$props.actionItems;

		return $$props.actionItems.map((item) => replaceWithNumberedCitations(item, $$props.citationMapping));
	});

	var section = root_1();
	var h3 = $.child(section);
	var text = $.only_child(h3, true);
	var ul = $.sibling(h3, 2);

	$.each(ul, 21, () => $.get(displayItems), $.index, ($$anchor, item) => {
		const itemCitations = $.derived(() => getCitedArticlesForText($.get(item), $$props.citationMapping, articles()));
		var li = root();
		var node = $.child(li);

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
					section: 'user_action_items'
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

		$.reset(li);
		$.template_effect(() => li.dir = li.dir);
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(section);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => storyLocalizer()("section.actionItems") || "Action Items"
	]);

	$.append($$anchor, section);
	$.pop();
}