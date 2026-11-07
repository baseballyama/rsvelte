import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<tr><!></tr>`);

export default function Tr($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var tr = root();

	$.attribute_effect(tr, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("hover:bg-card-muted/60 data-[state=selected]:bg-card-muted/60 transition-[background-color] duration-150 ease-out", className())
	]);

	var node = $.child(tr);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tr);
	$.append($$anchor, tr);
	$.pop();
}