import * as $ from 'svelte/internal/server';
import { RangeCalendar as RangeCalendarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

export default function Range_calendar_year_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			value,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<span${$.attr_class($.clsx(cn('has-focus:border-ring border-input has-focus:ring-ring/50 relative flex rounded-md border shadow-xs has-focus:ring-[3px]', className)))}>`);

			{
				function child($$renderer, { props, yearItems, selectedYearItem }) {
					$$renderer.select({ ...props, value }, ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(yearItems);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let yearItem = each_array[$$index];

							$$renderer.option(
								{
									value: yearItem.value,
									selected: value !== undefined
										? yearItem.value === value
										: yearItem.value === selectedYearItem.value
								},
								($$renderer) => {
									$$renderer.push(`${$.escape(yearItem.label)}`);
								}
							);
						}

						$$renderer.push(`<!--]-->`);
					});

					$$renderer.push(` <span class="[&amp;>svg]:text-muted-foreground flex h-(--cell-size) items-center gap-1 rounded-md ps-2 pe-1 text-sm font-medium select-none [&amp;>svg]:size-3.5" aria-hidden="true">${$.escape(yearItems.find((item) => item.value === value)?.label || selectedYearItem.label)} `);
					ChevronDownIcon($$renderer, { class: 'size-4' });
					$$renderer.push(`<!----></span>`);
				}

				if (RangeCalendarPrimitive.YearSelect) {
					$$renderer.push('<!--[-->');

					RangeCalendarPrimitive.YearSelect($$renderer, $.spread_props([
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