import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Calendar as CalendarPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'variant'
]);

export default function Calendar_prev_button($$anchor, $$props) {
	$.push($$props, true);

	const Fallback = ($$anchor) => {
		{
			let $0 = $.derived(() => cn("size-4", $$props.class));

			IconPlaceholder($$anchor, {
				lucide: 'ChevronLeftIcon',
				tabler: 'IconChevronLeft',
				hugeicons: 'ArrowLeftIcon',
				phosphor: 'CaretLeftIcon',
				remixicon: 'RiArrowLeftSLine',
				get class() {
					return $.get($0);
				}
			});
		}
	};

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "ghost"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: variant() }), "size-(--cell-size) bg-transparent p-0 select-none disabled:opacity-50 rtl:rotate-180", $$props.class));

		$.component(node, () => CalendarPrimitive.PrevButton, ($$anchor, CalendarPrimitive_PrevButton) => {
			CalendarPrimitive_PrevButton($$anchor, $.spread_props(
				{
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
						var node_1 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.snippet(node_2, () => $$props.children ?? $.noop);
								$.append($$anchor, fragment_3);
							};

							var alternate = ($$anchor) => {
								Fallback($$anchor);
							};

							$.if(node_1, ($$render) => {
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