import * as $ from 'svelte/internal/server';
import Product from '$lib/components/product-catalogue/product-card.svelte';
import { Carousel, CarouselContent, CarouselItem } from '$lib/components/ui/carousel/index.js';
import CarouselPrevious from '$lib/components/ui/carousel/carousel-previous.svelte';
import CarouselNext from '$lib/components/ui/carousel/carousel-next.svelte';
import { CollectionsRenderer } from '$lib/core/composables/index.js';

export default function Collections($$renderer) {
	{
		function content($$renderer, { displayProduct, collectionData }) {
			if (collectionData.length > 0) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array = $.ensure_array_like(collectionData);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let data = each_array[index];

					$$renderer.push(`<div${$.attr_class(`py-10 page-width ${index % 2 === 1 ? 'bg-muted/30' : ''}`)}><div class="mx-auto w-full"><div class="mb-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"><div class="text-left"><h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">${$.escape(data.name)}</h2> <div class="mt-2 h-1 w-12 bg-primary"></div></div></div> <div class="relative">`);

					Carousel($$renderer, {
						opts: { align: 'start', loop: true },
						class: 'w-full',
						children: ($$renderer) => {
							CarouselContent($$renderer, {
								class: '-ml-1',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(data?.collectionvalues);

									for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
										let prod = each_array_1[$$index];

										if (prod?.products) {
											$$renderer.push('<!--[0-->');

											CarouselItem($$renderer, {
												class: 'basis-full pl-1 mobiles:basis-[48%] sm:basis-[33%] md:basis-[25%] lg:basis-[20%] xl:basis-1/6',
												children: ($$renderer) => {
													$$renderer.push(`<div class="h-full">`);
													Product($$renderer, { product: prod.products, displayProduct });
													$$renderer.push(`<!----></div>`);
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <div class="absolute -right-2 -top-20 hidden items-center gap-2 md:flex">`);
							CarouselPrevious($$renderer, { class: 'static translate-y-0' });
							$$renderer.push(`<!----> `);
							CarouselNext($$renderer, { class: 'static translate-y-0' });
							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		CollectionsRenderer($$renderer, { content, $$slots: { content: true } });
	}
}