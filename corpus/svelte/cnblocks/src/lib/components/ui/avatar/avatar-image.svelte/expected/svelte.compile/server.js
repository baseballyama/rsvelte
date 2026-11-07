import * as $ from 'svelte/internal/server';
import { Avatar as AvatarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Avatar_image($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			src,
			alt,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AvatarPrimitive.Image) {
				$$renderer.push('<!--[-->');

				AvatarPrimitive.Image($$renderer, $.spread_props([
					{ src, alt, class: cn("aspect-square size-full", className) },
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