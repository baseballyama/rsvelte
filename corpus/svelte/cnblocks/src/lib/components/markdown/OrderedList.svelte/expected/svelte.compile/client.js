import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<ol><!></ol>`);

export default function OrderedList($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var ol = root();

	$.attribute_effect(ol, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("mt-6 list-decimal space-y-2 pl-6 text-base leading-relaxed text-foreground/70 [&>li]:pl-1", className())
	]);

	var node = $.child(ol);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ol);
	$.append($$anchor, ol);
	$.pop();
}