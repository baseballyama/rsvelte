import * as $ from 'svelte/internal/server';
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";
import { tv } from "tailwind-variants";

const inputGroupButtonVariants = tv({
	base: "cn-input-group-button flex items-center shadow-none",
	variants: {
		size: {
			xs: "cn-input-group-button-size-xs",
			sm: "cn-input-group-button-size-sm",
			"icon-xs": "cn-input-group-button-size-icon-xs",
			"icon-sm": "cn-input-group-button-size-icon-sm"
		}
	},
	defaultVariants: { size: "xs" }
});

export default function Input_group_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			type = "button",
			variant = "ghost",
			size = "xs",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Button($$renderer, $.spread_props([
				{
					type,
					'data-size': size,
					variant,
					class: cn(inputGroupButtonVariants({ size }), className)
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
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
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