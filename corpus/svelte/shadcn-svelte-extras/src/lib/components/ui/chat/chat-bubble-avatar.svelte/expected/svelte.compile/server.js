import * as $ from 'svelte/internal/server';
import { Root } from '$lib/components/ui/avatar';
import { Avatar as AvatarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

export default function Chat_bubble_avatar($$renderer, $$props) {
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
			Root($$renderer, $.spread_props([
				{
					class: cn("order-1 group-data-[variant='sent']/chat-bubble:order-2", className)
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