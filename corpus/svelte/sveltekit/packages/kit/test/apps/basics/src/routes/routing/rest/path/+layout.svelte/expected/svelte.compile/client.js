import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a href="/routing/rest/path/one">one</a> <a href="/routing/rest/path/two">two</a> <a href="/routing/rest/path/three">three</a> <a href="/routing/rest/path/four">four</a> <a href="/routing/rest/path/five">five</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 10);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}