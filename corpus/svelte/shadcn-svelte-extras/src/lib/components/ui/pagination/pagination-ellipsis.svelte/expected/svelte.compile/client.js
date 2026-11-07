import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<span><!> <span class="sr-only">More pages</span></span>`);

export default function Pagination_ellipsis($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var span = root();

	$.attribute_effect(
		span,
		($0) => ({
			'aria-hidden': 'true',
			'data-slot': 'pagination-ellipsis',
			class: $0,
			...restProps
		}),
		[
			() => cn("flex size-9 items-center items-center justify-center justify-center [&_svg:not([class*='size-'])]:size-4", $$props.class)
		]
	);

	var node = $.child(span);

	MoreHorizontalIcon(node, {});
	$.next(2);
	$.reset(span);
	$.bind_this(span, ($$value) => ref($$value), () => ref());
	$.append($$anchor, span);
	$.pop();
}