import * as $ from 'svelte/internal/server';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

export default function Range_calendar_month_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			value,
			onchange,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<span${$.attr_class($.clsx(cn("has-focus:border-ring border-input has-focus:ring-ring/50 relative flex rounded-md border shadow-xs has-focus:ring-[3px]", className)))}>`);

			{
				function child($$renderer, { props, monthItems, selectedMonthItem }) {
					$$renderer.select({ ...props, value, onchange }, ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(monthItems);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let monthItem = each_array[$$index];

							$$renderer.option(
								{
									value: monthItem.value,
									selected: value !== undefined
										? monthItem.value === value
										: monthItem.value === selectedMonthItem.value
								},
								($$renderer) => {
									$$renderer.push(`${$.escape(monthItem.label)}`);
								}
							);
						}

						$$renderer.push(`<!--]-->`);
					});

					$$renderer.push(` <span class="[&amp;>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md ps-2 pe-1 text-sm font-medium select-none [&amp;>svg]:size-3.5" aria-hidden="true">${$.escape(monthItems.find((item) => item.value === value)?.label || selectedMonthItem.label)} `);
					ChevronDownIcon($$renderer, { class: 'size-4' });
					$$renderer.push(`<!----></span>`);
				}

				if (RangeCalendarPrimitive.MonthSelect) {
					$$renderer.push('<!--[-->');

					RangeCalendarPrimitive.MonthSelect($$renderer, $.spread_props([
						{ class: 'absolute inset-0 opacity-0' },
						restProps,
						{
							get ref() {
								return ref;
							},

							set ref($$value) {
								ref = $$value;
								$$settled = false;
							},
							child,
							$$slots: { child: true }
						}
					]));

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`</span>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}