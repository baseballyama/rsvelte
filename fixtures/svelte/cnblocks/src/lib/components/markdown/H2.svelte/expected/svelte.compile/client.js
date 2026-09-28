import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<h2><!></h2>`);

export default function H2($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var h2 = root();

	$.attribute_effect(h2, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("mt-4 scroll-m-20 font-sans text-2xl font-medium text-foreground", className())
	]);

	var node = $.child(h2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h2);
	$.append($$anchor, h2);
	$.pop();
}