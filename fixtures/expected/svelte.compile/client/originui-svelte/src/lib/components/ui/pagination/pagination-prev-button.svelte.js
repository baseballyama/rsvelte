import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PaginationLink from './pagination-link.svelte';
import { cn } from '$lib/utils.js';
import ChevronLeft from '@lucide/svelte/icons/chevron-left';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref']);
var root = $.from_html(`<!> <span>Previous</span>`, 1);

export default function Pagination_prev_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn('gap-1 pl-2.5', $$props.class));

		PaginationLink($$anchor, $.spread_props(
			{
				'aria-label': 'Go to previous page',
				size: 'default',
				get class() {
					return $.get($0);
				}
			},
			() => restProps,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node = $.first_child(fragment_1);

					ChevronLeft(node, { size: 16 });
					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}