import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<h3><!></h3>`);

export default function H3($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var h3 = root();

	$.attribute_effect(h3, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("mt-4 scroll-m-24 font-display text-xl font-medium text-foreground", className())
	]);

	var node = $.child(h3);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h3);
	$.append($$anchor, h3);
	$.pop();
}