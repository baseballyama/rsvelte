import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import { buttonVariants } from "$lib/components/ui/button/index.js";
import { cn } from "$lib/utils.js";

const Fallback = ($$anchor) => {
	ChevronLeftIcon($$anchor, { class: 'size-4' });
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'variant'
]);

export default function Range_calendar_prev_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "ghost"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: variant() }), "size-(--cell-size) bg-transparent p-0 select-none disabled:opacity-50 rtl:rotate-180", $$props.class));
		let $1 = $.derived(() => $$props.children || Fallback);

		$.component(node, () => RangeCalendarPrimitive.PrevButton, ($$anchor, RangeCalendarPrimitive_PrevButton) => {
			RangeCalendarPrimitive_PrevButton($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					},

					get children() {
						return $.get($1);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}