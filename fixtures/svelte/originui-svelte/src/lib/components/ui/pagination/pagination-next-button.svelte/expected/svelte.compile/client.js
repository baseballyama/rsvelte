import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PaginationLink from './pagination-link.svelte';
import { cn } from '$lib/utils.js';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref']);
var root = $.from_html(`<span>Next</span> <!>`, 1);

export default function Pagination_next_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn('gap-1 pr-2.5', $$props.class));

		PaginationLink($$anchor, $.spread_props(
			{
				'aria-label': 'Go to next page',
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
					var node = $.sibling($.first_child(fragment_1), 2);

					ChevronRight(node, { size: 16 });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}