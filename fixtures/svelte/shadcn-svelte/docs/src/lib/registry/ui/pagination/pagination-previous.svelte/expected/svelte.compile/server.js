import * as $ from 'svelte/internal/server';
import { Pagination as PaginationPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Pagination_previous($$renderer, $$props) {
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
			if (PaginationPrimitive.PrevButton) {
				$$renderer.push('<!--[-->');

				PaginationPrimitive.PrevButton($$renderer, $.spread_props([
					{
						'aria-label': 'Go to previous page',
						class: cn(buttonVariants({ variant: "ghost", size: "default" }), "cn-pagination-previous", className)
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
							IconPlaceholder($$renderer, {
								lucide: 'ChevronLeftIcon',
								tabler: 'IconChevronLeft',
								hugeicons: 'ArrowLeft01Icon',
								phosphor: 'CaretLeftIcon',
								remixicon: 'RiArrowLeftSLine',
								'data-icon': 'inline-start'
							});

							$$renderer.push(`<!----> <span class="cn-pagination-previous-text hidden sm:block">Previous</span>`);
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