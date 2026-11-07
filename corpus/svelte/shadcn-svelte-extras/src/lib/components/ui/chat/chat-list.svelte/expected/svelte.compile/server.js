import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';
import { onMount } from 'svelte';
import Button from '$lib/components/button.svelte';
import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
import { scale } from 'svelte/transition';
import { UseAutoScroll } from '$lib/hooks/use-auto-scroll.svelte.js';

export default function Chat_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			children,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		// Prevents movement on page load
		let canScrollSmooth = false;

		const autoScroll = new UseAutoScroll();

		onMount(() => {
			canScrollSmooth = true;
		});

		$$renderer.push(`<div class="relative"><div${$.attributes({
			...rest,
			class: $.clsx(cn('no-scrollbar flex h-full w-full flex-col gap-4 overflow-y-auto p-4', className, { 'scroll-smooth': canScrollSmooth }))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div> `);

		if (!autoScroll.isAtBottom) {
			$$renderer.push(`<!--[0--><div>`);

			Button($$renderer, {
				onclick: () => autoScroll.scrollToBottom(),
				variant: 'outline',
				size: 'icon',
				class: 'absolute bottom-2 left-1/2 inline-flex -translate-x-1/2 transform rounded-full shadow-md',
				children: ($$renderer) => {
					ArrowDownIcon($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { ref });
	});
}