import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<link rel="canonical"/>`);

export default function Canonical($$anchor, $$props) {
	$.push($$props, true);

	// Self-canonical for routes that hand-roll their <svelte:head> instead of rendering <SeoHeader>.
	// Deliberately drops the query string: these routes have no paginated or filtered variants, so
	// every parameterised form of the URL should fold back to the bare path.
	// Do NOT add this to a layout — a page that also renders SeoHeader would then emit two
	// conflicting canonicals, which makes Google ignore both.
	$.head('1mwj5s4', ($$anchor) => {
		var link = root();

		$.template_effect(() => $.set_attribute(link, 'href', page.url.origin + page.url.pathname));
		$.append($$anchor, link);
	});

	$.pop();
}