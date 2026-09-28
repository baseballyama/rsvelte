import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1> </h1> <!> <a href="/encoded/escape-sequences/:-)">:-)</a> <a href="/encoded/escape-sequences/%23">#</a> <a href="/encoded/escape-sequences/%2F">/</a> <a href="/encoded/escape-sequences/%3f">?</a> <a href="/encoded/escape-sequences/苗">苗</a> <a href="/encoded/escape-sequences/&lt;">&lt;</a> <a href="/encoded/escape-sequences/1&lt;2">1&lt;2</a> <a href="/encoded/escape-sequences/🤪">🤪</a> <a href="/encoded/escape-sequences/%25">%</a>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var node = $.sibling(h1, 2);

	$.slot(node, $$props, 'default', {}, null);
	$.next(18);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => decodeURIComponent(page.url.pathname.split('/').pop() ?? '')
	]);

	$.append($$anchor, fragment);
	$.pop();
}