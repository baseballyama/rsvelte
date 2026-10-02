import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
import { cn } from '$lib/utils.js';
import { buttonVariants } from '../button/index.js';

const Fallback = ($$anchor) => {
	var fragment = root();
	var node = $.first_child(fragment);

	ChevronLeftIcon(node, { class: 'size-4' });
	$.next(2);
	$.append($$anchor, fragment);
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<!> <span>Previous</span>`, 1);

export default function Pagination_prev_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment_1 = $.comment();
	var node_1 = $.first_child(fragment_1);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: 'ghost' }), 'pl-2!', $$props.class));

		$.component(node_1, () => PaginationPrimitive.PrevButton, ($$anchor, PaginationPrimitive_PrevButton) => {
			PaginationPrimitive_PrevButton($$anchor, $.spread_props(
				{
					'aria-label': 'Go to previous page',
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
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.snippet(node_3, () => $$props.children ?? $.noop);
								$.append($$anchor, fragment_3);
							};

							var alternate = ($$anchor) => {
								Fallback($$anchor);
							};

							$.if(node_2, ($$render) => {
								if ($$props.children) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}