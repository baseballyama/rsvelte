import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<td><!></td>`);

export default function Td($$anchor, $$props) {
	var td = root();
	var node = $.child(td);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(td);
	$.append($$anchor, td);
}