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

var root = $.from_html(`<caption><!></caption>`);

export default function Table_caption($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var caption = root();

	$.attribute_effect(caption, ($0) => ({ 'data-slot': 'table-caption', class: $0, ...restProps }), [
		() => cn('text-muted-foreground mt-4 text-sm', $$props.class)
	]);

	var node = $.child(caption);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(caption);
	$.bind_this(caption, ($$value) => ref($$value), () => ref());
	$.append($$anchor, caption);
	$.pop();
}