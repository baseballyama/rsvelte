import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<tbody><!></tbody>`);

export default function Table_body($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var tbody = root();

	$.attribute_effect(tbody, ($0) => ({ class: $0, ...restProps }), [() => cn("[&_tr:last-child]:border-0", $$props.class)]);

	var node = $.child(tbody);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tbody);
	$.append($$anchor, tbody);
	$.pop();
}