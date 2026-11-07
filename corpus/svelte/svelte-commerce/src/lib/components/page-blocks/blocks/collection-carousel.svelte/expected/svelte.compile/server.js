import * as $ from 'svelte/internal/server';
import Product from '$lib/components/product-catalogue/product-card.svelte';
import { Carousel, CarouselContent, CarouselItem } from '$lib/components/ui/carousel/index.js';
import CarouselPrevious from '$lib/components/ui/carousel/carousel-previous.svelte';
import CarouselNext from '$lib/components/ui/carousel/carousel-next.svelte';
import { getCollectionState } from '$lib/core/stores/collection.svelte.js';
import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

export default function Collection_carousel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { block } = $$props;
		const collectionState = getCollectionState();
		const collection = $.derived(() => collectionState.getOneById(block.entityId));

		const flexBasis = $.derived(() => {
			const x = 1 / (block.metadata.viewCount || 6);

			return x * 100;
		});

		$$renderer.push(`<div class="w-full">`);

		if (!collection() || collectionState.loading) {
			$$renderer.push('<!--[0-->');
			Skeleton($$renderer, {});
		} else {
			$$renderer.push(`<!--[-1--><div class="mx-auto w-full">`);

			if (block.metadata.showHeader) {
				$$renderer.push(`<!--[0--><div class="mb-6 text-center md:text-left">`);

				if (collection().name) {
					$$renderer.push(`<!--[0--><h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">${$.escape(collection().name)}</h2> <div class="mx-auto mt-2 h-1 w-12 bg-primary md:mx-0"></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (collection().subTitle) {
					$$renderer.push(`<!--[0--><p class="mt-4 text-sm font-medium text-muted-foreground">${$.escape(collection().subTitle)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="relative">`);

			Carousel($$renderer, {
				opts: { align: 'start', loop: true },
				class: 'w-full',
				children: ($$renderer) => {
					CarouselContent($$renderer, {
						class: '-ml-1',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(collection()?.collectionvalues);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let prod = each_array[$$index];

								if (prod?.products) {
									$$renderer.push('<!--[0-->');

									CarouselItem($$renderer, {
										style: `flex-basis: ${$.stringify(flexBasis())}%; padding-left: ${$.stringify(block.metadata.gridColumnGap ?? 4)}px;`,
										children: ($$renderer) => {
											$$renderer.push(`<div class="h-full">`);

											Product($$renderer, {
												hideCartControls: !block.metadata.showCartControls,
												product: prod.products
											});

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

					$$renderer.push(`<!----> `);

					if (block.metadata.showHeader) {
						$$renderer.push(`<!--[0--><div class="absolute -right-2 -top-20 hidden items-center gap-2 md:flex">`);
						CarouselPrevious($$renderer, { class: 'static translate-y-0' });
						$$renderer.push(`<!----> `);
						CarouselNext($$renderer, { class: 'static translate-y-0' });
						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}