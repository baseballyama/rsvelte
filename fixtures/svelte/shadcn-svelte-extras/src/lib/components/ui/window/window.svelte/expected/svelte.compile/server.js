import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Window($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, contentClass } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn('border-border bg-background aspect-video w-full rounded-lg border', className)))}><div class="border-b border-inherit p-4"><div class="flex items-center gap-2"><div class="size-2 rounded-full bg-[#ef4444]"></div> <div class="size-2 rounded-full bg-[#eab308]"></div> <div class="size-2 rounded-full bg-[#22c55e]"></div></div></div> <div${$.attr_class($.clsx(cn('p-4', contentClass)))}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}