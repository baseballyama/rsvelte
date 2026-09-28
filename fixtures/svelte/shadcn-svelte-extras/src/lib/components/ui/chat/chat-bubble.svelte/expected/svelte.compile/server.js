import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Chat_bubble($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			variant,
			children,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			...rest,
			class: $.clsx(cn("group/chat-bubble flex max-w-[80%] flex-row place-items-end gap-2 data-[variant='sent']:place-self-end", className)),
			'data-variant': variant
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref });
	});
}