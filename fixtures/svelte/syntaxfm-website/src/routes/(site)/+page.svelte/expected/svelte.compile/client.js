import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PodcastHero from '$lib/PodcastHero.svelte';
import ShowCard from '$lib/ShowCard.svelte';

var root = $.from_html(`<h1 class="visually-hidden">Syntax Podcast</h1> <!> <section aria-label="Latest podcast episodes full layout" class="svelte-1ewzqr7"><h3 class="lines">Latest Episodes</h3> <div class="grid"><!> <!> <div class="grid-center" style="grid-column: 1 / -1;"><a href="/shows" class="button">See all shows</a></div></div></section>`, 1);

export default function _page($$anchor, $$props) {
	let latest = $.derived(() => $$props.data.latest);
	let last_ten = $.derived(() => $.get(latest));
	let latest_show = null;
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	PodcastHero(node, {});

	var section = $.sibling(node, 2);
	var div = $.sibling($.child(section), 2);

	$.set_style(div, '', {}, { 'margin-bottom': '2rem' });

	var node_1 = $.child(div);

	{
		var consequent = ($$anchor) => {
			ShowCard($$anchor, { display: 'highlight', show: latest_show });
		};

		$.if(node_1, ($$render) => {
			if (latest_show) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => $.get(last_ten), $.index, ($$anchor, latest_ep) => {
		ShowCard($$anchor, {
			get show() {
				return $.get(latest_ep);
			}
		});
	});

	$.next(2);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, fragment);
}