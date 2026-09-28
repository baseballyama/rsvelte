import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<h1><!></h1>`);

export default function H1($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var h1 = root();

	$.attribute_effect(h1, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("scroll-m-24 font-sans text-3xl font-medium text-foreground", className())
	]);

	var node = $.child(h1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h1);
	$.append($$anchor, h1);
	$.pop();
}