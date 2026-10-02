import * as $ from 'svelte/internal/server';
import { Bluesky, Mail, RSS, X, YouTube } from '$lib/icons';
import * as config from '$lib/site/config';

export default function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<footer class="svelte-5aznnr"><div class="follow"><p class="svelte-5aznnr">Follow</p> <ul class="svelte-5aznnr"><li class="svelte-5aznnr"><a href="/newsletter" class="svelte-5aznnr">`);
		Mail($$renderer, { width: 20, height: 20, 'aria-hidden': true });
		$$renderer.push(`<!----> <span>Newsletter</span></a></li> <li class="svelte-5aznnr"><a${$.attr('href', config.youtube)} target="_blank" rel="noreferrer" class="svelte-5aznnr">`);
		YouTube($$renderer, { width: 20, height: 20, 'aria-hidden': true });
		$$renderer.push(`<!----> <span>YouTube</span></a></li> <li class="svelte-5aznnr"><a${$.attr('href', config.twitter)} target="_blank" rel="noreferrer" class="svelte-5aznnr">`);
		X($$renderer, { width: 20, height: 20, 'aria-hidden': true });
		$$renderer.push(`<!----> <span>Twitter</span></a></li> <li class="svelte-5aznnr"><a${$.attr('href', config.bluesky)} target="_blank" rel="noreferrer" class="svelte-5aznnr">`);
		Bluesky($$renderer, { width: 20, height: 20, 'aria-hidden': true });
		$$renderer.push(`<!----> <span>Bluesky</span></a></li> <li class="svelte-5aznnr"><a href="/rss.xml" target="_blank" class="svelte-5aznnr">`);
		RSS($$renderer, { width: 20, height: 20, 'aria-hidden': true });
		$$renderer.push(`<!----> <span>RSS</span></a></li></ul></div> <div class="other"><p class="svelte-5aznnr">Other</p> <ul class="svelte-5aznnr"><li class="svelte-5aznnr"><a href="/about" class="svelte-5aznnr">About</a></li> <li class="svelte-5aznnr"><a${$.attr('href', config.uses)} target="_blank" rel="noreferrer" class="svelte-5aznnr">Uses</a></li></ul></div></footer>`);
	});
}