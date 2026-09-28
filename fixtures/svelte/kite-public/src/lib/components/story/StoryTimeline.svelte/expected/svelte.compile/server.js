import * as $ from 'svelte/internal/server';
import { s } from '$lib/client/localization.svelte';
import { languageSettings } from '$lib/data/settings.svelte.js';
import { timeTravelBatch } from '$lib/stores/timeTravelBatch.svelte';
import { getCitedArticlesForText } from '$lib/utils/citationAggregator';
import { replaceWithNumberedCitations } from '$lib/utils/citationContext';
import { formatTimelineDate } from '$lib/utils/formatTimelineDate';
import { parseTimelineEvent } from '$lib/utils/textParsing';
import CitationText from './CitationText.svelte';
import SelectableText from './SelectableText.svelte';

export default function StoryTimeline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		// Can be objects with date/description or strings with "::" separator
		let {
			timeline,
			articles = [],
			citationMapping,
			storyLocalizer = s,
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick
		} = $$props;

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
			return timeline.map((event) => {
				const parsed = parseTimelineEvent(event);
				const formattedDate = formatTimelineDate(parsed.date_iso, parsed.date, languageSettings.ui, batchYear());
				const result = { ...parsed, date: formattedDate };

				if (citationMapping && result.content) {
					return {
						...result,
						content: replaceWithNumberedCitations(result.content, citationMapping)
					};
				}

				return result;
			});
		});

		$$renderer.push(`<section class="mt-6"><h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">${$.escape(storyLocalizer("section.timeline") || "Timeline")}</h3> <ol class="timeline svelte-s67xbs" role="list" aria-label="Chronological timeline of events"><!--[-->`);

		const each_array = $.ensure_array_like(displayEvents());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let event = each_array[index];
			const eventCitations = getCitedArticlesForText(event.content, citationMapping, articles);

			$$renderer.push(`<li class="timeline-item svelte-s67xbs" role="listitem"${$.attr('aria-label', `Event ${$.stringify(index + 1)} of ${$.stringify(displayEvents().length)}`)}><div class="timeline-marker svelte-s67xbs" aria-hidden="true"><div class="timeline-dot svelte-s67xbs">${$.escape(index + 1)}</div></div> <div class="timeline-content svelte-s67xbs">`);

			if (event.date) {
				$$renderer.push(`<!--[0--><div class="timeline-date svelte-s67xbs" dir="auto">${$.escape(event.date)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="timeline-description svelte-s67xbs" dir="auto">`);

			if (flashcardMode) {
				$$renderer.push('<!--[0-->');

				SelectableText($$renderer, {
					text: event.content,
					flashcardMode,
					selectedWords,
					shouldJiggle,
					onWordClick,
					section: 'timeline'
				});
			} else {
				$$renderer.push('<!--[-1-->');

				CitationText($$renderer, {
					text: event.content,
					showFavicons: false,
					showNumbers: false,
					inline: true,
					articles: eventCitations.citedArticles,
					citationMapping,
					storyLocalizer
				});
			}

			$$renderer.push(`<!--]--></div></div></li>`);
		}

		$$renderer.push(`<!--]--></ol></section>`);
	});
}