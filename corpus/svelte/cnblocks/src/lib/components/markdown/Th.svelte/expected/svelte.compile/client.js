import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<th><!></th>`);

export default function Th($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var th = root();

	$.attribute_effect(th, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("h-10 px-4 text-left align-middle font-normal text-foreground", className())
	]);

	var node = $.child(th);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(th);
	$.append($$anchor, th);
	$.pop();
}