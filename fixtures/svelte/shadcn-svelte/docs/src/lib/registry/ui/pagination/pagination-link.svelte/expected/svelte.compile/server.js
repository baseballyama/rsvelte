import * as $ from 'svelte/internal/server';
import { Pagination as PaginationPrimitive } from "bits-ui";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Pagination_link($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			size = "icon",
			isActive,
			page,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function Fallback($$renderer) {
			$$renderer.push(`<!---->${$.escape(page.value)}`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (PaginationPrimitive.Page) {
				$$renderer.push('<!--[-->');

				PaginationPrimitive.Page($$renderer, $.spread_props([
					{
						page,
						'aria-current': isActive ? "page" : undefined,
						'data-slot': 'pagination-link',
						'data-active': isActive,
						'data-size': size,
						class: cn(buttonVariants({ size, variant: isActive ? "outline" : "ghost" }), "cn-pagination-link", className)
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