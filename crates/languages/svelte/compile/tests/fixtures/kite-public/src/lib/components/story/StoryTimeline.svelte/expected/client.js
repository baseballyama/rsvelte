import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { s } from '$lib/client/localization.svelte';
import { languageSettings } from '$lib/data/settings.svelte.js';
import { timeTravelBatch } from '$lib/stores/timeTravelBatch.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { formatTimelineDate } from '$lib/utils/formatTimelineDate';
import { parseTimelineEvent } from '$lib/utils/textParsing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

var root = $.from_html(`<div class="timeline-date svelte-s67xbs" dir="auto"> </div>`);
var root_1 = $.from_html(`<li class="timeline-item svelte-s67xbs" role="listitem"><div class="timeline-marker svelte-s67xbs" aria-hidden="true"><div class="timeline-dot svelte-s67xbs"></div></div> <div class="timeline-content svelte-s67xbs"><!> <div class="timeline-description svelte-s67xbs" dir="auto"><!></div></div></li>`);
var root_2 = $.from_html(`<section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200"> </h3> <ol class="timeline svelte-s67xbs" role="list" aria-label="Chronological timeline of events"></ol></section>`);

export default function StoryTimeline($$anchor, $$props) {
	$.push($$props, true);

	// Props
	// Can be objects with date/description or strings with "::" separator
	let articles = $.prop($$props, 'articles', 19, () => []),
		storyLocalizer = $.prop($$props, 'storyLocalizer', 3, s),
		flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Derive batch year for date formatting
	const batchYear = $.derived(() => {
		const createdAt = timeTravelBatch.getCreatedAt();

		if (createdAt) {
			const year = new Date(createdAt).getFullYear();

			if (!Number.isNaN(year)) return year;
		}

		return new Date().getFullYear();
	});

	// Parse timeline events and prepare display data
	const displayEvents = $.derived(() => {
		return $$props.timeline.map((event) => {
			const parsed = parseTimelineEvent(event);
			const formattedDate = formatTimelineDate(parsed.date_iso, parsed.date, languageSettings.ui, $.get(batchYear));
			const result = { ...parsed, date: formattedDate };

			if ($$props.citationMapping && result.content) {
				return {
					...result,
					content: replaceWithNumberedCitations(result.content, $$props.citationMapping)
				};
			}

			return result;
		});
	});

	var section = root_2();
	var h3 = $.child(section);
	var text = $.only_child(h3, true);
	var ol = $.sibling(h3, 2);

	$.each(ol, 21, () => $.get(displayEvents), $.index, ($$anchor, event, index) => {
		const eventCitations = $.derived(() => getCitedArticlesForText($.get(event).content, $$props.citationMapping, articles()));
		var li = root_1();
		var div = $.child(li);
		var div_1 = $.child(div);

		div_1.textContent = index + 1;
		$.reset(div);

		var div_2 = $.sibling(div, 2);
		var node = $.child(div_2);

		{
			var consequent = ($$anchor) => {
				var div_3 = root();
				var text_1 = $.only_child(div_3, true);

				$.template_effect(() => {
					$.set_text(text_1, $.get(event).date);
					div_3.dir = div_3.dir;
				});

				$.append($$anchor, div_3);
			};

			$.if(node, ($$render) => {
				if ($.get(event).date) $$render(consequent);
			});
		}

		var div_4 = $.sibling(node, 2);
		var node_1 = $.child(div_4);

		{
			var consequent_1 = ($$anchor) => {
				SelectableText($$anchor, {
					get text() {
						return $.get(event).content;
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
					section: 'timeline'
				});
			};

			var alternate = ($$anchor) => {
				CitationText($$anchor, {
					get text() {
						return $.get(event).content;
					},
					showFavicons: false,
					showNumbers: false,
					inline: true,
					get articles() {
						return $.get(eventCitations).citedArticles;
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
				if (flashcardMode()) $$render(consequent_1); else $$render(alternate, -1);
			});
		}

		$.reset(div_4);
		$.reset(div_2);
		$.reset(li);

		$.template_effect(() => {
			$.set_attribute(li, 'aria-label', `Event ${index + 1} of ${$.get(displayEvents).length ?? ''}`);
			div_4.dir = div_4.dir;
		});

		$.append($$anchor, li);
	});

	$.reset(ol);
	$.reset(section);
	$.template_effect(($0) => $.set_text(text, $0), [() => storyLocalizer()("section.timeline") || "Timeline"]);
	$.append($$anchor, section);
	$.pop();
}