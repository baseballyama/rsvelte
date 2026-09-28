import * as $ from 'svelte/internal/server';
import ShowCard from '$/lib/ShowCard.svelte';

export default function _page($$renderer, $$props) {
	let { data } = $$props;
	let video = $.derived(() => data.video);

	function insertBreaks(str) {
		return str.replace(/(\d{2}:\d{2})/g, (match, p1, offset) => {
			return offset === 0 ? match : `<br />${match}`;
		});
	}

	function trimAfterHr(htmlString) {
		const parts = htmlString.split('<hr>');

		return parts[0].trim();
	}

	function prepare_description(html) {
		let description = trimAfterHr(html);

		return insertBreaks(description);
	}

	if (video()) {
		$$renderer.push(`<!--[0--><div class="video_page layout full svelte-fkg8c8"><div class="content"><youtube-video controls=""${$.attr('src', `https://www.youtube.com/watch?v=${$.stringify(video().id)}`)} class="svelte-fkg8c8"></youtube-video> <h1 class="h3">${$.escape(video().title)}</h1></div> <section class="layout full"><div class="main">${$.html(prepare_description(video().description))}</div> <aside class="sidebar">`);

		if (video().shows.length > 0) {
			$$renderer.push(`<!--[0--><h2 class="h5">Related Shows</h2>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like(video().shows);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { show } = each_array[$$index];

			ShowCard($$renderer, { show });
		}

		$$renderer.push(`<!--]--></aside></section></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}