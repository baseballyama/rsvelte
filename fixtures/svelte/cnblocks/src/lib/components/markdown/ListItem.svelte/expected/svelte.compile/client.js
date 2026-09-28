import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<li><!></li>`);

export default function ListItem($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var li = root();

	$.attribute_effect(li, ($0) => ({ ...restProps, class: $0 }), [() => cn("leading-relaxed text-foreground/70", className())]);

	var node = $.child(li);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(li);
	$.append($$anchor, li);
	$.pop();
}