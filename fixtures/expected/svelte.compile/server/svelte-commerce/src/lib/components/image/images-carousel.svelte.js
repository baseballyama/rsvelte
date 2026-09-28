import * as $ from 'svelte/internal/server';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext
} from '$lib/components/ui/carousel';

import LazyImg from '$lib/core/components/image/lazy-img.svelte';

export default function Images_carousel($$renderer, $$props) {
	let { data = [] } = $$props;

	Carousel($$renderer, {
		opts: { align: 'center', loop: true },
		class: 'mx-auto w-[90%] py-10 sm:w-[80%]',
		children: ($$renderer) => {
			CarouselContent($$renderer, {
				class: 'flex flex-row items-center justify-between',
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(data);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let image = each_array[$$index];

						CarouselItem($$renderer, {
							class: 'flex-shrink-0 flex-grow-0 basis-auto px-2',
							children: ($$renderer) => {
								$$renderer.push(`<div class="h-[148px] w-[148px] mobiles:h-[176px] mobiles:w-[176px] mobilem:h-[201px] mobilem:w-[201px] mobilel:h-[245px] mobilel:w-[245px] laptop:h-[230px] laptop:w-[230px]">`);

								if (image) {
									$$renderer.push('<!--[0-->');

									LazyImg($$renderer, {
										src: image,
										alt: 'Image',
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

			$$renderer.push(`<!----> <div class="absolute left-2 top-1/2 z-30 -translate-y-1/2 translate-x-10 transform">`);

			CarouselPrevious($$renderer, {
				class: 'rounded-full bg-white p-2 text-black shadow-md hover:bg-gray-100'
			});

			$$renderer.push(`<!----></div> <div class="absolute right-2 top-1/2 z-30 -translate-x-10 -translate-y-1/2 transform">`);

			CarouselNext($$renderer, {
				class: 'rounded-full bg-white p-2 text-black shadow-md hover:bg-gray-100'
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}