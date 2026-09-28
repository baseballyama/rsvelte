import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<table><!></table>`);

export default function Table($$anchor, $$props) {
	var table = root();
	var node = $.child(table);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(table);
	$.append($$anchor, table);
}