import * as $ from 'svelte/internal/server';

export default function PlaylistVideo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { video, playlist } = $$props;

		$$renderer.push(`<div><a${$.attr('href', `/videos/${playlist.slug}/${video.slug}`)} class="svelte-7mgmi5"><img${$.attr('src', video.thumbnail)} class="thumbnail svelte-7mgmi5"${$.attr('alt', video.title)}/> <h3 class="h6 svelte-7mgmi5">${$.escape(video.title)}</h3></a></div>`);
	});
}