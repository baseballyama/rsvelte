import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<span><!> <span class="sr-only">More</span></span>`);

export default function Breadcrumb_ellipsis($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var span = root();

	$.attribute_effect(
		span,
		($0) => ({
			'data-slot': 'breadcrumb-ellipsis',
			role: 'presentation',
			'aria-hidden': 'true',
			class: $0,
			...restProps
		}),
		[
			() => cn('flex size-5 items-center justify-center [&>svg]:size-4', $$props.class)
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