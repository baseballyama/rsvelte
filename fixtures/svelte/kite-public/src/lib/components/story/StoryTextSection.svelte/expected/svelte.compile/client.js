import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <div class="mb-4 text-base text-gray-700 dark:text-gray-300"><!></div></section>`);

export default function StoryTextSection($$anchor, $$props) {
	$.push($$props, true);

	// Props
	// Section identifier for context
	let articles = $.prop($$props, 'articles', 19, () => []),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Convert citations to numbered format if mapping is available
	const displayContent = $.derived(() => {
		if (!$$props.citationMapping) return $$props.content;

		return replaceWithNumberedCitations($$props.content, $$props.citationMapping);
	});

	var section_1 = root();
	var h3 = $.child(section_1);
	var text = $.only_child(h3, true);
	var div = $.sibling(h3, 2);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			SelectableText($$anchor, {
				get text() {
					return $.get(displayContent);
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
					return $.get(displayContent);
				},
				showFavicons: false,
				showNumbers: false,
				get articles() {
					return articles();
				},

				get citationMapping() {
					return $$props.citationMapping;
				}
			});
		};

		$.if(node, ($$render) => {
			if (flashcardMode()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.reset(section_1);
	$.template_effect(() => $.set_text(text, $$props.title));
	$.append($$anchor, section_1);
	$.pop();
}