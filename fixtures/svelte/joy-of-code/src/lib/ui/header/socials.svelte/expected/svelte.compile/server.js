import * as $ from 'svelte/internal/server';
import { Bluesky, RSS, X, YouTube } from '$lib/icons';
import * as config from '$lib/site/config';

export default function Socials($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="socials svelte-21474c"><a${$.attr('href', config.youtube)} target="_blank" rel="noreferrer">`);
		YouTube($$renderer, { width: 24, height: 24, 'aria-label': 'YouTube' });
		$$renderer.push(`<!----></a> <a${$.attr('href', config.twitter)} target="_blank" rel="noreferrer">`);
		X($$renderer, { width: 24, height: 24, 'aria-label': 'Twitter' });
		$$renderer.push(`<!----></a> <a${$.attr('href', config.bluesky)} target="_blank" rel="noreferrer">`);
		Bluesky($$renderer, { width: 20, height: 20, 'aria-label': 'Bluesky' });
		$$renderer.push(`<!----></a> <a href="/rss.xml" target="_blank">`);
		RSS($$renderer, { width: 24, height: 24, 'aria-label': 'RSS feed' });
		$$renderer.push(`<!----></a></div>`);
	});
}