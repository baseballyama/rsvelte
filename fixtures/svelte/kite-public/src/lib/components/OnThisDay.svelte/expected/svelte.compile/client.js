import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OnThisDayEventTimeline from './onthisday/OnThisDayEventTimeline.svelte';
import OnThisDayPeopleCarousel from './onthisday/OnThisDayPeopleCarousel.svelte';
import OnThisDaySkeleton from './onthisday/OnThisDaySkeleton.svelte';
import WikipediaTooltip from './WikipediaTooltip.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="py-4" role="region" aria-label="OnThisDay events with Wikipedia links"><!></div> <!>`, 1);

export default function OnThisDay($$anchor, $$props) {
	$.push($$props, true);

	// Props
	// Language used for the OnThisDay content (for Wikipedia lookups)
	let language = $.prop($$props, 'language', 3, 'en');

	// Split stories into events and people
	const events = $.derived(() => $$props.stories.filter((story) => story.type === 'event'));

	const people = $.derived(() => $$props.stories.filter((story) => story.type === 'person' || story.type === 'people'));

	// Reference to Wikipedia tooltip component
	let wikipediaTooltip = $.state(null);

	// Handle Wikipedia interactions
	function handleWikipediaInteraction(event) {
		$.get(wikipediaTooltip)?.handleWikipediaInteraction(event);
	}

	function handleWikipediaLeave(event) {
		$.get(wikipediaTooltip)?.handleWikipediaLeave(event);
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			OnThisDaySkeleton($$anchor, {});
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root();
			var node_1 = $.first_child(fragment_2);

			OnThisDayEventTimeline(node_1, {
				get events() {
					return $.get(events);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					OnThisDayPeopleCarousel($$anchor, {
						get people() {
							return $.get(people);
						}
					});
				};

				$.if(node_2, ($$render) => {
					if ($.get(people).length > 0) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($$props.stories.length === 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_3 = $.sibling(div, 2);

	$.bind_this(
		WikipediaTooltip(node_3, {
			get language() {
				return language();
			},

			get onWikipediaClick() {
				return $$props.onWikipediaClick;
			}
		}),
		($$value) => $.set(wikipediaTooltip, $$value, true),
		() => $.get(wikipediaTooltip)
	);

	$.delegated('mouseover', div, handleWikipediaInteraction);
	$.event('mouseleave', div, handleWikipediaLeave);
	$.event('focus', div, handleWikipediaInteraction);
	$.event('blur', div, handleWikipediaLeave);
	$.delegated('click', div, handleWikipediaInteraction);

	$.delegated('keydown', div, (e) => {
		if (e.key === "Enter" || e.key === " ") {
			handleWikipediaInteraction(e);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['mouseover', 'click', 'keydown']);