import * as $ from 'svelte/internal/server';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious
} from '$lib/components/ui/carousel';

import LazyImg from '$lib/core/components/image/lazy-img.svelte';

export default function Brands_carousel($$renderer, $$props) {
	let { data = [] } = $$props;

	Carousel($$renderer, {
		opts: { align: 'center', loop: true, dragFree: true },
		class: 'mx-auto w-full py-10 sm:w-[90%] laptop:w-[80%]',
		children: ($$renderer) => {
			CarouselContent($$renderer, {
				class: '-ml-1',
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(data);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let image = each_array[$$index];

						CarouselItem($$renderer, {
							class: 'md:basis-1/5',
							children: ($$renderer) => {
								$$renderer.push(`<div class="h-[74px] w-[186px]">`);

								if (image) {
									$$renderer.push('<!--[0-->');

									LazyImg($$renderer, {
										src: image,
										alt: 'Featured brand partner logo',
										class: 'h-full w-full rounded-none object-cover'
									});
								} else {
									$$renderer.push(`<!--[-1--><div class="flex h-full w-full items-center justify-center rounded-none bg-gray-200 text-gray-500">No Image</div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CarouselPrevious($$renderer, {
				class: 'absolute left-0 top-1/2 z-30 m-[5px] h-10 w-10 -translate-y-1/2 transform bg-white text-black sm:-left-4'
			});

			$$renderer.push(`<!----> `);

			CarouselNext($$renderer, {
				class: 'absolute right-0 top-1/2 z-30 m-[5px] h-10 w-10 -translate-y-1/2 transform bg-white text-black sm:-right-4'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}