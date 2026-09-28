import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { useCitationProcessing } from '$lib/utils/citationProcessing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<section class="mt-6 rounded-lg bg-[#CED8FB] p-4 dark:bg-[#2A3B5E]"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100"> </h3> <p class="text-base text-gray-700 dark:text-gray-200"><!></p></section>`);

export default function StoryDidYouKnow($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let articles = $.prop($$props, 'articles', 19, () => []),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Convert citations to numbered format if mapping is available
	const displayContent = $.derived(() => {
		const processed = useCitationProcessing($$props.content, $$props.citationMapping);

		// Ensure we return a string (content is always a string, but TypeScript needs assurance)
		return typeof processed === 'string' ? processed : processed.join(' ');
	});

	var section = root();
	var h3 = $.child(section);
	var text = $.only_child(h3, true);
	var p = $.sibling(h3, 2);
	var node = $.child(p);

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

				get shouldJiggle() {
					return shouldJiggle();
				},

				get onWordClick() {
					return $$props.onWordClick;
				},
				section: 'did_you_know'
			});
		};

		var alternate = ($$anchor) => {
			CitationText($$anchor, {
				get text() {
					return $.get(displayContent);
				},
				inline: false,
				get articles() {
					return articles();
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
	$.reset(section);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => storyLocalizer()("section.didYouKnow") || "Did You Know?"
	]);

	$.append($$anchor, section);
	$.pop();
}