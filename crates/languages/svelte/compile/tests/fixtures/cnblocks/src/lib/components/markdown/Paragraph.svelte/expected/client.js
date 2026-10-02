import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<p><!></p>`);

export default function Paragraph($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var p = root();

	$.attribute_effect(p, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("mt-4 text-base leading-normal text-muted-foreground first:mt-0", className())
	]);

	var node = $.child(p);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(p);
	$.append($$anchor, p);
	$.pop();
}