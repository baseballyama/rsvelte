import * as $ from 'svelte/internal/server';
import get_show_path from '$/utilities/slug.js';
import SwaggyNewsletterForm from '$lib/newsletter/SwaggyNewsletterForm.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		let show = $.derived(() => data.show),
			prev_show = $.derived(() => data.prev_show),
			next_show = $.derived(() => data.next_show);

		$$renderer.push(`<div class="main"><div class="show-notes">${$.html(show().show_notes)}</div> <nav class="prev-next svelte-wwy4r7"><div class="prev svelte-wwy4r7">`);

		if (prev_show()) {
			$$renderer.push(`<!--[0--><a${$.attr('href', get_show_path(prev_show()))} class="prev-link"><p class="a svelte-wwy4r7">← Prev #${$.escape(prev_show().number)}</p> <p class="text-sm svelte-wwy4r7">${$.escape(prev_show().title)}</p></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="next svelte-wwy4r7">`);

		if (next_show()) {
			$$renderer.push(`<!--[0--><a${$.attr('href', get_show_path(next_show()))} class="next-link"><p class="a svelte-wwy4r7">Next #${$.escape(next_show().number)} →</p> <p class="text-sm svelte-wwy4r7">${$.escape(next_show().title)}</p></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></nav></div> <div class="sidebar">`);

		if (show()?.videos?.length > 0) {
			$$renderer.push(`<!--[0--><div class="related-videos svelte-wwy4r7"><h2 class="h5">Related Videos</h2> <!--[-->`);

			const each_array = $.ensure_array_like(show().videos);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { video } = each_array[$$index];

				$$renderer.push(`<a${$.attr('href', `/videos/${video.playlists[0].playlist.slug}/${video.slug}`)}><img${$.attr('src', video.thumbnail)} class="thumbnail svelte-wwy4r7"${$.attr('alt', video.title)}/></a>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="sticky zone">`);
		SwaggyNewsletterForm($$renderer, {});
		$$renderer.push(`<!----></div></div>`);
	});
}