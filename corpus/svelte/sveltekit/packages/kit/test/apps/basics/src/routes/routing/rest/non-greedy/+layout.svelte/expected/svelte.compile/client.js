import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>non-greedy</h1> <!> <a href="/routing/rest/non-greedy/foo/one/two">foo/one/two</a> <a href="/routing/rest/non-greedy/food/one/two">food/one/two</a> <a href="/routing/rest/non-greedy/one-bar/two/three">one-bar/two/three</a> <a href="/routing/rest/non-greedy/one-bard/two/three">one-bard/two/three</a>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	$.slot(node, $$props, 'default', {}, null);
	$.next(8);
	$.append($$anchor, fragment);
}