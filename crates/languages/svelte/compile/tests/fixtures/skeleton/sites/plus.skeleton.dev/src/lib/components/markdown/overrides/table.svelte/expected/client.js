import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<div class="table-wrap"><table><!></table></div>`);

export default function Table($$anchor, $$props) {
	const rest = $.rest_props($$props, rest_excludes);
	var div = root();
	var table = $.child(div);

	$.attribute_effect(table, () => ({ class: 'table', ...rest }));

	var node = $.child(table);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(table);
	$.reset(div);
	$.append($$anchor, div);
}