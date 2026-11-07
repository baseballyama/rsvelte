import * as $ from 'svelte/internal/server';
import Label from '$lib/components/ui/label.svelte';
import Slider from '$lib/components/ui/slider.svelte';
import { cn } from '$lib/utils.js';

export default function Slider_07($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const max = 12;
		const skipInterval = 2; // Set to 1 to allow no text skipping
		const ticks = [...Array(max + 1)].map((_, i) => i);

		$$renderer.push(`<div class="*:not-first:mt-4">`);

		Label($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Slider with ticks`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div>`);

		Slider($$renderer, {
			type: 'single',
			value: 5,
			max,
			step: ticks,
			'aria-label': 'Slider with ticks'
		});

		$$renderer.push(`<!----> <span class="text-muted-foreground mt-3 flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium" aria-hidden="true"><!--[-->`);

		const each_array = $.ensure_array_like(ticks);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let _ = each_array[index];

			$$renderer.push(`<span class="flex w-0 flex-col items-center justify-center gap-2"><span${$.attr_class($.clsx(cn('bg-muted-foreground/70 h-1 w-px', index % skipInterval !== 0 && 'h-0.5')))}></span> <span${$.attr_class($.clsx(cn(index % skipInterval !== 0 && 'opacity-0')))}>${$.escape(index)}</span></span>`);
		}

		$$renderer.push(`<!--]--></span></div></div>`);
	});
}