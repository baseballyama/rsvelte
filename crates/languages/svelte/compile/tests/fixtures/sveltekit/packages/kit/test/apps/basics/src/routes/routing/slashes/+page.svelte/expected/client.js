import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<a href="/routing/">/routing/</a> <a href="/routing/?">/routing/?</a> <a href="/routing/?foo=bar">/routing/?foo=bar</a> <a>external</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var a = $.sibling($.first_child(fragment), 6);

	$.template_effect(($0) => $.set_attribute(a, 'href', `http://localhost:${$0 ?? ''}/with-slash/`), [() => page.url.searchParams.get('port')]);
	$.append($$anchor, fragment);
	$.pop();
}