import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function Nested($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'slot1', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}