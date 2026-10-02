import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import AutoScroll from 'embla-carousel-auto-scroll';
import EmblaCarousel from 'embla-carousel';
import { page } from '$app/state';

export default function Slider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let carouselApi = null;
		let emblaNode = null;
		const newsTickerPlugin = $.derived(() => page.data?.store?.plugins?.newsTicker);

		onMount(() => {
			if (!emblaNode) return;

			carouselApi = EmblaCarousel(
				emblaNode,
				{
					axis: 'x',
					loop: true,
					duration: 20, // Faster snap animation
					startIndex: 0,
					align: 'center'
				},
				[AutoScroll({ playOnInit: true })]
			);
		});

		if (newsTickerPlugin()?.active) {
			$$renderer.push(`<!--[0--><div class="relative w-full"><div class="embla flex h-12 w-full gap-4 bg-black text-white svelte-rwgio5"><div class="embla__container svelte-rwgio5"><!--[-->`);

			const each_array = $.ensure_array_like({ length: 10 });

			for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
				let _ = each_array[idx];

				$$renderer.push(`<div class="embla__slide flex items-center justify-between whitespace-nowrap text-center svelte-rwgio5"><p>${$.html(newsTickerPlugin().html)}</p> <div class="flex flex-grow justify-evenly"><div class="h-[1px] w-[60%] border-[2px] border-b border-gray-300"></div></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}