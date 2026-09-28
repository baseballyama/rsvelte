import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<p><!></p>`);

export default function Item_description($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var p = root();

	$.attribute_effect(p, ($0) => ({ 'data-slot': 'item-description', class: $0, ...restProps }), [
		() => cn('text-muted-foreground [&>a:hover]:text-primary line-clamp-2 text-left text-sm leading-normal font-normal group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4', $$props.class)
	]);

	var node = $.child(p);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(p);
	$.bind_this(p, ($$value) => ref($$value), () => ref());
	$.append($$anchor, p);
	$.pop();
}