import * as $ from 'svelte/internal/server';
import { LinkPreview as HoverCardPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Hover_card_content($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			align = "center",
			sideOffset = 4,
			portalProps,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (HoverCardPrimitive.Portal) {
				$$renderer.push('<!--[-->');

				HoverCardPrimitive.Portal($$renderer, $.spread_props([
					portalProps,
					{
						children: ($$renderer) => {
							if (HoverCardPrimitive.Content) {
								$$renderer.push('<!--[-->');

								HoverCardPrimitive.Content($$renderer, $.spread_props([
									{
										sideOffset,
										align,
										class: cn("z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", className)
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