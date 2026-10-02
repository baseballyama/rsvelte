import * as $ from 'svelte/internal/server';
import LoadingDots from './loading-dots.svelte';
import { cn } from '$lib/utils.js';

export default function Chat_bubble_message($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			typing = false,
			class: className,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			...rest,
			class: $.clsx(cn("bg-secondary group-data-[variant='sent']/chat-bubble:bg-primary group-data-[variant='sent']/chat-bubble:text-primary-foreground order-2 rounded-lg p-4 text-sm group-data-[variant='received']/chat-bubble:rounded-bl-none group-data-[variant='sent']/chat-bubble:order-1 group-data-[variant='sent']/chat-bubble:rounded-br-none", className))
		})}>`);

		if (typing) {
			$$renderer.push(`<!--[0--><div class="flex size-full place-items-center justify-center">`);
			LoadingDots($$renderer, {});
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}