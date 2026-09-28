import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1>Great success!</h1> <a href="/routing/a">a</a> <a href="/routing/ambiguous/ok.json" rel="external">ok</a> <a href="/routing/next-paint">next-paint</a> <a href="/routing/symlink-from">symlinked</a> <a>elsewhere</a> <a href="/static.json">static.json</a> <a href="/routing/b" data-sveltekit-reload="">b</a> <div class="hydrate-test"></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var a = $.sibling($.first_child(fragment), 10);

	$.next(6);
	$.template_effect(($0) => $.set_attribute(a, 'href', `http://localhost:${$0 ?? ''}`), [() => page.url.searchParams.get('port')]);
	$.append($$anchor, fragment);
	$.pop();
}