import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<base href="/"/>`);

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();

	$.head('obrx4g', ($$anchor) => {
		var base = root();

		$.append($$anchor, base);
	});

	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
}