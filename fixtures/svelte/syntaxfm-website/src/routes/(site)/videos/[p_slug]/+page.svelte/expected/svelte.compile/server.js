import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	let { data } = $$props;
	let playlist = $.derived(() => data.playlist);

	if (playlist()) {
		$$renderer.push(`<!--[0--><h1 class="h3">${$.escape(playlist().title)}</h1> <div class="playlist-grid grid svelte-2d02k7"><!--[-->`);

		const each_array = $.ensure_array_like(playlist().videos);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { video } = each_array[$$index];

			$$renderer.push(`<a${$.attr('href', `/videos/${playlist().slug}/${video.slug}`)}><img${$.attr('src', video.thumbnail)} class="thumbnail svelte-2d02k7"${$.attr('alt', video.title)}/> <h3 class="h6 svelte-2d02k7">${$.escape(video.title)}</h3></a>`);
		}

		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}