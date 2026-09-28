import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'href',
	'class'
]);

var root = $.from_html(`<a><!></a>`);

export default function Link($$anchor, $$props) {
	$.push($$props, true);

	const href = $.prop($$props, 'href', 3, "#"),
		className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var a = root();

	$.attribute_effect(a, ($0) => ({ href: href(), ...restProps, class: $0 }), [
		() => cn("text-foreground underline underline-offset-2 transition-[color] duration-150 ease-out hover:text-foreground/70", className())
	]);

	var node = $.child(a);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}