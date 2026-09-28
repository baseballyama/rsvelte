import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

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
			() => cn("cn-pagination-ellipsis flex items-center justify-center", $$props.class)
		]
	);

	var node = $.child(span);

	IconPlaceholder(node, {
		lucide: 'MoreHorizontalIcon',
		tabler: 'IconDots',
		hugeicons: 'MoreHorizontalCircle01Icon',
		phosphor: 'DotsThreeIcon',
		remixicon: 'RiMoreLine'
	});

	$.next(2);
	$.reset(span);
	$.bind_this(span, ($$value) => ref($$value), () => ref());
	$.append($$anchor, span);
	$.pop();
}