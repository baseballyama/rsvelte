import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<div class="my-6 no-scrollbar w-full overflow-y-auto rounded-lg border"><table><!></table></div>`);

export default function Table($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root();
	var table = $.child(div);

	$.attribute_effect(table, ($0) => ({ class: $0, ...restProps }), [
		() => cn("relative w-full overflow-hidden border-none text-sm [&_tbody_tr:last-child]:border-b-0", $$props.class)
	]);

	var node = $.child(table);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(table);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}