import * as $ from 'svelte/internal/server';
import Icon from './Icon.svelte';

export default function ListenLinks($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show } = $$props;

		$$renderer.push(`<a class="icon svelte-e9n9in" target="_blank" title="Watch or Listen on Spotify" aria-label="Spotify"${$.attr('href', show.spotify_id
			? `https://open.spotify.com/episode/${show.spotify_id}`
			: `https://open.spotify.com/search/syntax.fm ${encodeURI(show.title)}/episodes`)}>`);

		Icon($$renderer, { name: 'spotify' });
		$$renderer.push(`<!----></a> `);

		if (show.youtube_url) {
			$$renderer.push(`<!--[0--><a class="icon svelte-e9n9in" target="_blank" title="Watch on Youtube" aria-label="Youtube"${$.attr('href', show.youtube_url)}${$.attr_style('', { '--fg': '#F61C0D' })}>`);
			Icon($$renderer, { name: 'youtube' });
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <a class="icon svelte-e9n9in" title="Listen on Apple Podcasts" aria-label="Apple Podcasts" target="_blank" href="https://podcasts.apple.com/ca/podcast/syntax-tasty-web-development-treats/id1253186678">`);
		Icon($$renderer, { name: 'apple-podcasts' });
		$$renderer.push(`<!----></a>`);
	});
}