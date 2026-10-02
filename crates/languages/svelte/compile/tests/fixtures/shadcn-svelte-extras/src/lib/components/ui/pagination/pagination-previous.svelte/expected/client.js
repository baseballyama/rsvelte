import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { PaginationLink } from './index.js';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<!> <span class="cn-pagination-previous-text hidden sm:block">Previous</span>`, 1);

export default function Pagination_previous($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn('pl-2!', $$props.class));

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
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node = $.first_child(fragment_1);

					ChevronLeftIcon(node, { 'data-icon': 'inline-start' });
					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}