import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<link rel="alternate" href="/path-base/rss.xml"/>`);

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();

	$.head('1v6snj2', ($$anchor) => {
		var link = root();

		$.append($$anchor, link);
	});

	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}