import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Data_table_cell($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var div = root();

	$.attribute_effect(div, () => ({ ...restProps }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
}