import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<td><!></td>`);

export default function Td($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var td = root();

	$.attribute_effect(td, ($0) => ({ class: $0, ...restProps }), [
		() => cn("border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right", $$props.class)
	]);

	var node = $.child(td);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(td);
	$.append($$anchor, td);
	$.pop();
}