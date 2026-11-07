import * as $ from 'svelte/internal/server';
import { site } from '$lib/constants/site';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('1abhr9c', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Cookie Policy | Networking Toolbox</title>`);
			});

			$$renderer.push(`<meta name="description" content="Cookie policy for Networking Toolbox - we don't use cookies"/> <meta property="og:title"${$.attr('content', `Cookie Policy | ${$.stringify(site.title)}`)}/> <meta property="og:description" content="Our cookie policy: we don't use them"/> <meta property="og:url"${$.attr('content', `${$.stringify(site.url)}/about/legal/cookies`)}/>`);
		});

		$$renderer.push(`<div class="hero"><h2>Cookie Policy</h2> <p class="lead">We don't use cookies.</p></div> <section><h3>No Cookies</h3> <p>Networking Toolbox does not use cookies of any kind. We don't set, read, or store any cookies in your browser.</p></section> <section><h3>What We Use Instead</h3> <p>For storing your preferences (theme, layout, bookmarks), we use browser localStorage. Unlike cookies, localStorage
    data:</p> <ul><li>Never gets sent to our servers</li> <li>Stays entirely in your browser</li> <li>Isn't subject to cookie consent laws</li> <li>Can be cleared anytime in your browser settings</li></ul> <p>Learn more about what we store in our <a href="/about/legal/privacy#local-storage">Privacy Policy</a>.</p></section>`);
	});
}