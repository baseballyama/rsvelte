import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<tr><!></tr>`);

export default function Table_row($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var tr = root();

	$.attribute_effect(tr, ($0) => ({ class: $0, ...restProps }), [() => cn("border-b", $$props.class)]);

	var node = $.child(tr);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tr);
	$.append($$anchor, tr);
	$.pop();
}