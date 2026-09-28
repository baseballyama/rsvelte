import * as $ from 'svelte/internal/server';
import PlaylistVideo from './PlaylistVideo.svelte';

export default function PlaylistCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { playlist } = $$props;

		$$renderer.push(`<article class="card svelte-1odf0i4"><p class="date svelte-1odf0i4">${$.escape(playlist.item_count)} Videos</p> <h3 class="svelte-1odf0i4"><a${$.attr('href', `/videos/${playlist.slug}`)} class="svelte-1odf0i4">${$.escape(playlist.title)}</a></h3> <div class="grid playlist-grid svelte-1odf0i4"><!--[-->`);

		const each_array = $.ensure_array_like(playlist.videos);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let playlist_video = each_array[$$index];

			PlaylistVideo($$renderer, { video: playlist_video.video, playlist });
		}

		$$renderer.push(`<!--]--></div> <a class="button see-all svelte-1odf0i4"${$.attr('href', `/videos/${$.stringify(playlist.slug)}`)}>See All Videos</a></article>`);
	});
}