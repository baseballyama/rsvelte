import * as $ from 'svelte/internal/server';
import { Calendar as CalendarPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Calendar_prev_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			variant = "ghost",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function Fallback($$renderer) {
			IconPlaceholder($$renderer, {
				lucide: 'ChevronLeftIcon',
				tabler: 'IconChevronLeft',
				hugeicons: 'ArrowLeftIcon',
				phosphor: 'CaretLeftIcon',
				remixicon: 'RiArrowLeftSLine',
				class: cn("size-4", className)
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (CalendarPrimitive.PrevButton) {
				$$renderer.push('<!--[-->');

				CalendarPrimitive.PrevButton($$renderer, $.spread_props([
					{
						class: cn(buttonVariants({ variant }), "size-(--cell-size) bg-transparent p-0 select-none disabled:opacity-50 rtl:rotate-180", className)
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

						children: ($$renderer) => {
							if (children) {
								$$renderer.push('<!--[0-->');
								children?.($$renderer);
								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push('<!--[-1-->');
								Fallback($$renderer);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
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