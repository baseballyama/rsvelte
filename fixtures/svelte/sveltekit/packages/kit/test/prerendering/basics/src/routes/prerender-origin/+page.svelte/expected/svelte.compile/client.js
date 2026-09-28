import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<a>Please crawl this</a>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const href = new URL('/prerender-origin/dynamic', page.url.origin).href;
	var a = root();

	$.template_effect(() => $.set_attribute(a, 'href', href));
	$.append($$anchor, a);
	$.pop();
}