import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function _page($$anchor) {
	const mod = import('#lib/test.server.js');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => mod, null, ($$anchor, resolved) => {
		var p = root();
		var text = $.only_child(p, true);

		$.template_effect(() => $.set_text(text, $.get(resolved).should_explode));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}