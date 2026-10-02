import * as $ from 'svelte/internal/server';
import OnThisDayEventTimeline from './onthisday/OnThisDayEventTimeline.svelte';
import OnThisDayPeopleCarousel from './onthisday/OnThisDayPeopleCarousel.svelte';
import OnThisDaySkeleton from './onthisday/OnThisDaySkeleton.svelte';
import WikipediaTooltip from './WikipediaTooltip.svelte';

export default function OnThisDay($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		// Language used for the OnThisDay content (for Wikipedia lookups)
		let { stories, language = 'en', onWikipediaClick } = $$props;

		// Split stories into events and people
		const events = $.derived(() => stories.filter((story) => story.type === 'event'));

		const people = $.derived(() => stories.filter((story) => story.type === 'person' || story.type === 'people'));

		// Reference to Wikipedia tooltip component
		let wikipediaTooltip = null;

		// Handle Wikipedia interactions
		function handleWikipediaInteraction(event) {
			wikipediaTooltip?.handleWikipediaInteraction(event);
		}

		function handleWikipediaLeave(event) {
			wikipediaTooltip?.handleWikipediaLeave(event);
		}

		$$renderer.push(`<div class="py-4" role="region" aria-label="OnThisDay events with Wikipedia links">`);

		if (stories.length === 0) {
			$$renderer.push('<!--[0-->');
			OnThisDaySkeleton($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
			OnThisDayEventTimeline($$renderer, { events: events() });
			$$renderer.push(`<!----> `);

			if (people().length > 0) {
				$$renderer.push('<!--[0-->');
				OnThisDayPeopleCarousel($$renderer, { people: people() });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div> `);
		WikipediaTooltip($$renderer, { language, onWikipediaClick });
		$$renderer.push(`<!---->`);
	});
}