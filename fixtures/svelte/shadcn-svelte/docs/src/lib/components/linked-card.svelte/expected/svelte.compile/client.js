import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'href',
	'children'
]);

var root = $.from_html(`<a><!></a>`);

export default function Linked_card($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var a = root();

	$.attribute_effect(a, ($0) => ({ href: $$props.href, class: $0, ...restProps }), [
		() => cn("flex w-full flex-col items-center rounded-xl bg-surface p-6 text-surface-foreground transition-colors hover:bg-surface/80 sm:p-10", $$props.class)
	]);

	var node = $.child(a);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}