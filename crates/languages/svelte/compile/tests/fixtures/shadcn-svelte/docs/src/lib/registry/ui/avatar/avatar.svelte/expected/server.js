import * as $ from 'svelte/internal/server';
import { Avatar as AvatarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export default function Avatar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			loadingStatus = "loading",
			size = "default",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (AvatarPrimitive.Root) {
				$$renderer.push('<!--[-->');

				AvatarPrimitive.Root($$renderer, $.spread_props([
					{
						'data-slot': 'avatar',
						'data-size': size,
						class: cn("cn-avatar group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten", className)
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

						get loadingStatus() {
							return loadingStatus;
						},

						set loadingStatus($$value) {
							loadingStatus = $$value;
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
		$.bind_props($$props, { ref, loadingStatus });
	});
}