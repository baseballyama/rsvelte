import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<th><!></th>`);

export default function Table_head($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var th = root();

	$.attribute_effect(th, ($0) => ({ class: $0, ...restProps }), [
		() => cn('h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]', $$props.class)
	]);

	var node = $.child(th);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(th);
	$.bind_this(th, ($$value) => ref($$value), () => ref());
	$.append($$anchor, th);
	$.pop();
}