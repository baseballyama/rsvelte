import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p><!></p>`);

export default function P($$anchor, $$props) {
	var p = root();
	var node = $.child(p);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(p);
	$.append($$anchor, p);
}