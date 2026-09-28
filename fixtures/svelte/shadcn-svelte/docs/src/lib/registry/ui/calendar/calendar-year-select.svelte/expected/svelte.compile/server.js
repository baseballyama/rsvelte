import * as $ from 'svelte/internal/server';
import { Calendar as CalendarPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

export default function Calendar_year_select($$renderer, $$props) {
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
			$$renderer.push(`<span${$.attr_class($.clsx(cn("relative flex rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50", className)))}>`);

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

					$$renderer.push(` <span class="flex h-(--cell-size) items-center gap-1 rounded-md ps-2 pe-1 text-sm font-medium select-none [&amp;>svg]:size-3.5 [&amp;>svg]:text-muted-foreground" aria-hidden="true">${$.escape(yearItems.find((item) => item.value === value)?.label || selectedYearItem.label)} `);

					IconPlaceholder($$renderer, {
						lucide: 'ChevronDownIcon',
						tabler: 'IconChevronDown',
						hugeicons: 'ArrowDownIcon',
						phosphor: 'CaretDownIcon',
						remixicon: 'RiArrowDownSLine',
						class: cn("size-4", className)
					});

					$$renderer.push(`<!----></span>`);
				}

				if (CalendarPrimitive.YearSelect) {
					$$renderer.push('<!--[-->');

					CalendarPrimitive.YearSelect($$renderer, $.spread_props([
						{
							class: 'absolute inset-0 opacity-0 dark:bg-popover dark:text-popover-foreground'
						},
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