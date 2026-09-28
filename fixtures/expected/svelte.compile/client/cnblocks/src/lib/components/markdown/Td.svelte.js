import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<td><!></td>`);

export default function Td($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var td = root();

	$.attribute_effect(td, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("px-4 py-2 align-middle text-foreground/70", className())
	]);

	var node = $.child(td);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(td);
	$.append($$anchor, td);
	$.pop();
}