import * as $ from 'svelte/internal/server';
import PodcastHero from '$lib/PodcastHero.svelte';
import ShowCard from '$lib/ShowCard.svelte';

export default function _page($$renderer, $$props) {
	let { data } = $$props;
	let latest = $.derived(() => data.latest);
	let last_ten = $.derived(latest);
	let latest_show = null;

	$$renderer.push(`<h1 class="visually-hidden">Syntax Podcast</h1> `);
	PodcastHero($$renderer, {});
	$$renderer.push(`<!----> <section aria-label="Latest podcast episodes full layout" class="svelte-1ewzqr7"><h3 class="lines">Latest Episodes</h3> <div class="grid"${$.attr_style('', { 'margin-bottom': '2rem' })}>`);

	if (latest_show) {
		$$renderer.push('<!--[0-->');
		ShowCard($$renderer, { display: 'highlight', show: latest_show });
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like(last_ten());

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let latest_ep = each_array[$$index];

		ShowCard($$renderer, { show: latest_ep });
	}

	$$renderer.push(`<!--]--> <div class="grid-center" style="grid-column: 1 / -1;"><a href="/shows" class="button">See all shows</a></div></div></section>`);
}