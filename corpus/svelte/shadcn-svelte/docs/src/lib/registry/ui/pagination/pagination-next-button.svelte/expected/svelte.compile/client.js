import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination as PaginationPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";
import { buttonVariants } from "../button/index.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<span>Next</span> <!>`, 1);

export default function Pagination_next_button($$anchor, $$props) {
	$.push($$props, true);

	const Fallback = ($$anchor) => {
		var fragment = root();
		var node = $.sibling($.first_child(fragment), 2);

		{
			let $0 = $.derived(() => cn("size-4", $$props.class));

			IconPlaceholder(node, {
				lucide: 'ChevronRightIcon',
				tabler: 'IconChevronRight',
				hugeicons: 'ArrowRightIcon',
				phosphor: 'CaretRightIcon',
				remixicon: 'RiArrowRightSLine',
				get class() {
					return $.get($0);
				}
			});
		}

		$.append($$anchor, fragment);
	};

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment_1 = $.comment();
	var node_1 = $.first_child(fragment_1);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: "ghost" }), "cn-pagination-next", $$props.class));

		$.component(node_1, () => PaginationPrimitive.NextButton, ($$anchor, PaginationPrimitive_NextButton) => {
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