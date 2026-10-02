import * as $ from 'svelte/internal/server';
import { Pagination as PaginationPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";
import { buttonVariants } from "../button/index.js";

export default function Pagination_prev_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
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

			$$renderer.push(`<!----> <span>Previous</span>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (PaginationPrimitive.PrevButton) {
				$$renderer.push('<!--[-->');

				PaginationPrimitive.PrevButton($$renderer, $.spread_props([
					{
						'aria-label': 'Go to previous page',
						class: cn(buttonVariants({ variant: "ghost" }), "cn-pagination-previous", className)
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