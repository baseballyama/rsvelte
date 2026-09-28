import * as $ from 'svelte/internal/server';
import { Progress } from "bits-ui";
import { onMount } from "svelte";
import { cubicInOut } from "svelte/easing";
import { Tween } from "svelte/motion";

export default function Progress_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const labelId = $.props_id($$renderer);
		const tween = new Tween(13, { duration: 1000, easing: cubicInOut });

		onMount(() => {
			const timer = setTimeout(() => tween.set(66), 500);

			return () => {
				clearTimeout(timer);
			};
		});

		$$renderer.push(`<div class="flex w-[60%] flex-col gap-2"><div class="flex items-center justify-between text-sm font-medium"><span${$.attr('id', labelId)}>Uploading file...</span> <span>${$.escape(Math.round(tween.current))}%</span></div> `);

		if (Progress.Root) {
			$$renderer.push('<!--[-->');

			Progress.Root($$renderer, {
				'aria-labelledby': labelId,
				value: Math.round(tween.current),
				max: 100,
				class: 'bg-dark-10 shadow-mini-inset relative h-[15px] w-full overflow-hidden rounded-full',
				children: ($$renderer) => {
					$$renderer.push(`<div class="bg-foreground shadow-mini-inset h-full w-full flex-1 rounded-full"${$.attr_style(`transform: translateX(-${100 - 100 * (tween.current ?? 0) / 100}%)`)}></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}