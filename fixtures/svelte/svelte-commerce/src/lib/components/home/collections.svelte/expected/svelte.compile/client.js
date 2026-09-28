import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Product from '$lib/components/product-catalogue/product-card.svelte';
import { Carousel, CarouselContent, CarouselItem } from '$lib/components/ui/carousel/index.js';
import CarouselPrevious from '$lib/components/ui/carousel/carousel-previous.svelte';
import CarouselNext from '$lib/components/ui/carousel/carousel-next.svelte';
import { CollectionsRenderer } from '$lib/core/composables/index.js';

var root = $.from_html(`<div class="h-full"><!></div>`);
var root_1 = $.from_html(`<!> <div class="absolute -right-2 -top-20 hidden items-center gap-2 md:flex"><!> <!></div>`, 1);
var root_2 = $.from_html(`<div><div class="mx-auto w-full"><div class="mb-6 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"><div class="text-left"><h2 class="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl"> </h2> <div class="mt-2 h-1 w-12 bg-primary"></div></div></div> <div class="relative"><!></div></div></div>`);

export default function Collections($$anchor) {
	{
		const content = ($$anchor, $$arg0) => {
			let displayProduct = () => ($$arg0?.()).displayProduct;
			let collectionData = () => ($$arg0?.()).collectionData;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, collectionData, $.index, ($$anchor, data, index) => {
						var div = root_2();

						$.set_class(div, 1, `py-10 page-width ${index % 2 === 1 ? 'bg-muted/30' : ''}`);

						var div_1 = $.child(div);
						var div_2 = $.child(div_1);
						var div_3 = $.child(div_2);
						var h2 = $.child(div_3);
						var text = $.only_child(h2, true);

						$.next(2);
						$.reset(div_3);
						$.reset(div_2);

						var div_4 = $.sibling(div_2, 2);
						var node_2 = $.child(div_4);

						Carousel(node_2, {
							opts: { align: 'start', loop: true },
							class: 'w-full',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_3 = $.first_child(fragment_3);

								CarouselContent(node_3, {
									class: '-ml-1',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.each(node_4, 17, () => $.get(data)?.collectionvalues, (prod) => prod?.id, ($$anchor, prod) => {
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											{
												var consequent = ($$anchor) => {
													CarouselItem($$anchor, {
														class: 'basis-full pl-1 mobiles:basis-[48%] sm:basis-[33%] md:basis-[25%] lg:basis-[20%] xl:basis-1/6',
														children: ($$anchor, $$slotProps) => {
															var div_5 = root();
															var node_6 = $.child(div_5);

															Product(node_6, {
																get product() {
																	return $.get(prod).products;
																},

																get displayProduct() {
																	return displayProduct();
																}
															});

															$.reset(div_5);
															$.append($$anchor, div_5);
														},
														$$slots: { default: true }
													});
												};

												$.if(node_5, ($$render) => {
													if ($.get(prod)?.products) $$render(consequent);
												});
											}

											$.append($$anchor, fragment_5);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								var div_6 = $.sibling(node_3, 2);
								var node_7 = $.child(div_6);

								CarouselPrevious(node_7, { class: 'static translate-y-0' });

								var node_8 = $.sibling(node_7, 2);

								CarouselNext(node_8, { class: 'static translate-y-0' });
								$.reset(div_6);
								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});

						$.reset(div_4);
						$.reset(div_1);
						$.reset(div);
						$.template_effect(() => $.set_text(text, $.get(data).name));
						$.append($$anchor, div);
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if (collectionData().length > 0) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		CollectionsRenderer($$anchor, { content, $$slots: { content: true } });
	}
}