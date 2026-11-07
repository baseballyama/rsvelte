import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Inner($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'x', { foo: 5 }, null);
	$.reset(div);
	$.append($$anchor, div);
}