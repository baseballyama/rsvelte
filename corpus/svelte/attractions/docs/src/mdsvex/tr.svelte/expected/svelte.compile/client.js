import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<tr><!></tr>`);

export default function Tr($$anchor, $$props) {
	var tr = root();
	var node = $.child(tr);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(tr);
	$.append($$anchor, tr);
}