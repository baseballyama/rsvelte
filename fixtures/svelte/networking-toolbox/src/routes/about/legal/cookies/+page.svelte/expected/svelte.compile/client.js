import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { site } from '$lib/constants/site';

var root = $.from_html(`<meta name="description" content="Cookie policy for Networking Toolbox - we don't use cookies"/> <meta property="og:title"/> <meta property="og:description" content="Our cookie policy: we don't use them"/> <meta property="og:url"/>`, 1);

var root_1 = $.from_html(
	`<div class="hero"><h2>Cookie Policy</h2> <p class="lead">We don't use cookies.</p></div> <section><h3>No Cookies</h3> <p>Networking Toolbox does not use cookies of any kind. We don't set, read, or store any cookies in your browser.</p></section> <section><h3>What We Use Instead</h3> <p>For storing your preferences (theme, layout, bookmarks), we use browser localStorage. Unlike cookies, localStorage
    data:</p> <ul><li>Never gets sent to our servers</li> <li>Stays entirely in your browser</li> <li>Isn't subject to cookie consent laws</li> <li>Can be cleared anytime in your browser settings</li></ul> <p>Learn more about what we store in our <a href="/about/legal/privacy#local-storage">Privacy Policy</a>.</p></section>`,
	1
);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment_1 = root_1();

	$.head('1abhr9c', ($$anchor) => {
		var fragment = root();
		var meta = $.sibling($.first_child(fragment), 2);
		var meta_1 = $.sibling(meta, 4);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', `Cookie Policy | ${site.title ?? ''}`);
			$.set_attribute(meta_1, 'content', `${site.url ?? ''}/about/legal/cookies`);
		});

		$.effect(() => {
			$.document.title = 'Cookie Policy | Networking Toolbox';
		});

		$.append($$anchor, fragment);
	});

	$.next(4);
	$.append($$anchor, fragment_1);
	$.pop();
}