import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination as PaginationPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<span class="cn-pagination-next-text hidden sm:block">Next</span> <!>`, 1);

export default function Pagination_next($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: "ghost", size: "default" }), "cn-pagination-next", $$props.class));

		$.component(node, () => PaginationPrimitive.NextButton, ($$anchor, PaginationPrimitive_NextButton) => {
			PaginationPrimitive_NextButton($$anchor, $.spread_props(
				{
					'aria-label': 'Go to next page',
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
						var node_1 = $.sibling($.first_child(fragment_1), 2);

						IconPlaceholder(node_1, {
							lucide: 'ChevronRightIcon',
							tabler: 'IconChevronRight',
							hugeicons: 'ArrowRight01Icon',
							phosphor: 'CaretRightIcon',
							remixicon: 'RiArrowRightSLine',
							'data-icon': 'inline-end'
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}