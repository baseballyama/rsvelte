import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<meta name="robots" content="noindex, nofollow"/>`);

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();

	$.head('1mhbkox', ($$anchor) => {
		var meta = root();

		$.append($$anchor, meta);
	});

	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
}