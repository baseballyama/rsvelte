import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<th><!></th>`);

export default function Table_head($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var th = root();

	$.attribute_effect(th, ($0) => ({ class: $0, ...restProps }), [
		() => cn("text-muted-foreground h-10 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", $$props.class)
	]);

	var node = $.child(th);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(th);
	$.append($$anchor, th);
	$.pop();
}