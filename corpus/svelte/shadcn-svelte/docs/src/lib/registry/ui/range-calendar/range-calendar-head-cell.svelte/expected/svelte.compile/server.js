import * as $ from 'svelte/internal/server';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Range_calendar_head_cell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (RangeCalendarPrimitive.HeadCell) {
				$$renderer.push('<!--[-->');

				RangeCalendarPrimitive.HeadCell($$renderer, $.spread_props([
					{
						class: cn("w-(--cell-size) rounded-md text-[0.8rem] font-normal text-muted-foreground", className)
					},
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
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