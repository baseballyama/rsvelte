import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<div class="relative mt-2 mb-10 w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm"><table><!></table></div>`);

export default function Table($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();
	var table = $.child(div);

	$.attribute_effect(table, ($0) => ({ ...restProps, class: $0 }), [() => cn("w-full text-base [&_code]:text-sm", className())]);

	var node = $.child(table);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(table);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}