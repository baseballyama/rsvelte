import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';
import * as Drawer from '$lib/components/ui/drawer/index.js';
import * as Carousel from '$lib/components/ui/carousel/index.js';
import ProductGallery from './product-gallery.svelte';
import ShareButton from '$lib/core/components/plugins/share-button.svelte';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';

var root = $.from_html(`<link rel="preload" as="image" fetchpriority="high"/>`);
var root_1 = $.from_html(`<div class="absolute right-2 top-2 z-30 rounded-full bg-white block edp-gallery-float"><!></div>`);
var root_2 = $.from_html(`<div><svg class="[&amp;>*]:stroke-[1.2]" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" stroke="none" style="height: 20px; width: 20px;"><g stroke="#1C1C1C" stroke-width="1.5" clip-path="url(#icon-ymal_svg__a)"><rect width="8.9" height="13.7" x="5.55" y="3.15" rx="1.25"></rect><path stroke-linecap="round" stroke-linejoin="round" d="m14.4 6.4 4 1.2-4 8.8M5.6 6.4l-4 1.2 4 8.8"></path></g><defs><clipPath id="icon-ymal_svg__a"><path fill="#fff" d="M0 0h19.2v19.2H0z"></path></clipPath></defs></svg> <span class="sr-only">View similar</span></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="relative"><!></div> <!>`, 1);
var root_5 = $.from_html(`<div class="relative"><!> <!></div>`);

export default function Product_gallery_section($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();

	// The LCP element is the first gallery image, and it sits deep in the document (~246KB on jws,
	// behind the inlined style block), so the parser did not request it until ~1.2s after TTFB even
	// though the image itself costs far less than that to transfer. The delay is discovery, not bytes.
	// SvelteKit emits svelte:head content near the top of the head, ahead of the inline CSS, so the
	// preload scanner sees this almost immediately and starts the fetch while the document streams.
	//
	// NOTE: keep literal markup tags out of this comment. vite-preprocess scans the component text
	// for a style tag and will treat everything after one as CSS, which breaks the build.
	//
	// Measured on jws, identical local build with only this tag toggled (Pixel 5 / 4x CPU / Slow 4G):
	//   without preload  LCP image request starts 1615ms after TTFB
	//   with preload     LCP image request starts   48ms after TTFB
	//
	// The href MUST match what the gallery's main image renders — getImageCDNUrl(src, 1280, 0), the
	// cdnW/h defaults LazyImg uses for an auto-sized image — or the browser downloads it twice.
	// No imagesrcset/imagesizes: the main image deliberately carries no srcset (only the 96px
	// thumbnails do). If one is ever added there, this tag needs matching attributes.
	const videoURLRegex = /mp4$|webm$/;

	const lcpImage = $.derived(() => {
		const first = productState.productImagesArray?.[0];

		if (!first || videoURLRegex.test(first) || (/youtube\.com|youtu\.be/).test(first)) return null;

		return getImageCDNUrl(first, 1280, 0);
	});

	var div = root_5();

	$.head('1h1bsxf', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var link = root();

				$.template_effect(() => $.set_attribute(link, 'href', $.get(lcpImage)));
				$.append($$anchor, link);
			};

			$.if(node, ($$render) => {
				if ($.get(lcpImage)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});

	var node_1 = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();
			var node_2 = $.child(div_1);

			{
				let $0 = $.derived(() => page.data?.product?.title);
				let $1 = $.derived(() => page.data?.product?.thumbnail);
				let $2 = $.derived(() => page?.url?.href);

				ShareButton(node_2, {
					get productName() {
						return $.get($0);
					},

					get productImage() {
						return $.get($1);
					},

					get url() {
						return $.get($2);
					}
				});
			}

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (page?.data?.store?.plugins?.socialSharingButtons) $$render(consequent_1);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = root_4();
			var div_2 = $.first_child(fragment_1);
			var node_4 = $.child(div_2);

			{
				let $0 = $.derived(() => productState.productImagesArray || []);

				ProductGallery(node_4, {
					get images() {
						return $.get($0);
					}
				});
			}

			$.reset(div_2);

			var node_5 = $.sibling(div_2, 2);

			$.component(node_5, () => Drawer.Root, ($$anchor, Drawer_Root) => {
				Drawer_Root($$anchor, {
					direction: 'bottom',
					get open() {
						return productState.showSimilarDrawer;
					},

					set open($$value) {
						productState.showSimilarDrawer = $$value;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_6 = $.first_child(fragment_2);

						{
							var consequent_2 = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_7 = $.first_child(fragment_3);

								$.component(node_7, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
									Drawer_Trigger($$anchor, {
										class: 'absolute bottom-12 right-4 rounded-full bg-white p-2 sm:hidden edp-gallery-float',
										children: ($$anchor, $$slotProps) => {
											var div_3 = root_2();

											$.append($$anchor, div_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							};

							$.if(node_6, ($$render) => {
								if (productState.productsOfSameCategory?.length) $$render(consequent_2);
							});
						}

						var node_8 = $.sibling(node_6, 2);

						$.component(node_8, () => Drawer.Content, ($$anchor, Drawer_Content) => {
							Drawer_Content($$anchor, {
								class: '',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_3();
									var node_9 = $.first_child(fragment_4);

									$.component(node_9, () => Drawer.Header, ($$anchor, Drawer_Header) => {
										Drawer_Header($$anchor, {
											class: 'text-left',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_10 = $.first_child(fragment_5);

												$.component(node_10, () => Drawer.Title, ($$anchor, Drawer_Title) => {
													Drawer_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('You May Also Like');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_9, 2);

									{
										var consequent_3 = ($$anchor) => {
											var fragment_6 = $.comment();
											var node_12 = $.first_child(fragment_6);

											$.component(node_12, () => Carousel.Root, ($$anchor, Carousel_Root) => {
												Carousel_Root($$anchor, {
													class: 'px-4',
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_13 = $.first_child(fragment_7);

														$.component(node_13, () => Carousel.Content, ($$anchor, Carousel_Content) => {
															Carousel_Content($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = $.comment();
																	var node_14 = $.first_child(fragment_8);

																	$.each(node_14, 17, () => productState.productsOfSameCategory, $.index, ($$anchor, product) => {
																		var fragment_9 = $.comment();
																		var node_15 = $.first_child(fragment_9);

																		$.component(node_15, () => Carousel.Item, ($$anchor, Carousel_Item) => {
																			Carousel_Item($$anchor, {
																				class: 'basis-1/2',
																				onclick: () => {
																					productState.showSimilarDrawer = false;
																				},

																				children: ($$anchor, $$slotProps) => {
																					ProductCard($$anchor, {
																						get product() {
																							return $.get(product);
																						}
																					});
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_9);
																	});

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_6);
										};

										$.if(node_11, ($$render) => {
											if (productState.productsOfSameCategory?.length) $$render(consequent_3);
										});
									}

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_3, ($$render) => {
			if (productState.productImagesArray?.length > 0) $$render(consequent_4);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}