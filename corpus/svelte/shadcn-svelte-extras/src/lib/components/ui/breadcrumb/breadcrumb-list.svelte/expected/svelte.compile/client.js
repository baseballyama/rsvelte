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

var root = $.from_html(`<ol><!></ol>`);

export default function Breadcrumb_list($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var ol = root();

	$.attribute_effect(ol, ($0) => ({ 'data-slot': 'breadcrumb-list', class: $0, ...restProps }), [
		() => cn('text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word sm:gap-2.5', $$props.class)
	]);

	var node = $.child(ol);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ol);
	$.bind_this(ol, ($$value) => ref($$value), () => ref());
	$.append($$anchor, ol);
	$.pop();
}