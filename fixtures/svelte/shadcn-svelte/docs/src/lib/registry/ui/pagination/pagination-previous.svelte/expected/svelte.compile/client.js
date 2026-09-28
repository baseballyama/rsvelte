import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination as PaginationPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);
var root = $.from_html(`<!> <span class="cn-pagination-previous-text hidden sm:block">Previous</span>`, 1);

export default function Pagination_previous($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: "ghost", size: "default" }), "cn-pagination-previous", $$props.class));

		$.component(node, () => PaginationPrimitive.PrevButton, ($$anchor, PaginationPrimitive_PrevButton) => {
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
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						IconPlaceholder(node_1, {
							lucide: 'ChevronLeftIcon',
							tabler: 'IconChevronLeft',
							hugeicons: 'ArrowLeft01Icon',
							phosphor: 'CaretLeftIcon',
							remixicon: 'RiArrowLeftSLine',
							'data-icon': 'inline-start'
						});

						$.next(2);
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