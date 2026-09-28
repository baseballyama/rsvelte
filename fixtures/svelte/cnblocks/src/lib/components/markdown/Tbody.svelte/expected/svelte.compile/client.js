import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<tbody><!></tbody>`);

export default function Tbody($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var tbody = root();

	$.attribute_effect(tbody, ($0) => ({ ...restProps, class: $0 }), [() => cn("divide-y divide-border/60", className())]);

	var node = $.child(tbody);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tbody);
	$.append($$anchor, tbody);
	$.pop();
}