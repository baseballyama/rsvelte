import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { useProductState } from '$lib/core/composables/index.js';
import * as Drawer from '$lib/components/ui/drawer/index.js';
import * as Carousel from '$lib/components/ui/carousel/index.js';
import ProductGallery from './product-gallery.svelte';
import ShareButton from '$lib/core/components/plugins/share-button.svelte';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import { getImageCDNUrl } from '@misiki/kitcommerce-core/utils';

export default function Product_gallery_section($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1h1bsxf', $$renderer, ($$renderer) => {
				if (lcpImage()) {
					$$renderer.push(`<!--[0--><link rel="preload" as="image" fetchpriority="high"${$.attr('href', lcpImage())}/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			});

			$$renderer.push(`<div class="relative">`);

			if (page?.data?.store?.plugins?.socialSharingButtons) {
				$$renderer.push(`<!--[0--><div class="absolute right-2 top-2 z-30 rounded-full bg-white block edp-gallery-float">`);

				ShareButton($$renderer, {
					productName: page.data?.product?.title,
					productImage: page.data?.product?.thumbnail,
					url: page?.url?.href
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (productState.productImagesArray?.length > 0) {
				$$renderer.push(`<!--[0--><div class="relative">`);
				ProductGallery($$renderer, { images: productState.productImagesArray || [] });
				$$renderer.push(`<!----></div> `);

				if (Drawer.Root) {
					$$renderer.push('<!--[-->');

					Drawer.Root($$renderer, {
						direction: 'bottom',
						get open() {
							return productState.showSimilarDrawer;
						},

						set open($$value) {
							productState.showSimilarDrawer = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (productState.productsOfSameCategory?.length) {
								$$renderer.push('<!--[0-->');

								if (Drawer.Trigger) {
									$$renderer.push('<!--[-->');

									Drawer.Trigger($$renderer, {
										class: 'absolute bottom-12 right-4 rounded-full bg-white p-2 sm:hidden edp-gallery-float',
										children: ($$renderer) => {
											$$renderer.push(`<div><svg class="[&amp;>*]:stroke-[1.2]" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" stroke="none" style="height: 20px; width: 20px;"><g stroke="#1C1C1C" stroke-width="1.5" clip-path="url(#icon-ymal_svg__a)"><rect width="8.9" height="13.7" x="5.55" y="3.15" rx="1.25"></rect><path stroke-linecap="round" stroke-linejoin="round" d="m14.4 6.4 4 1.2-4 8.8M5.6 6.4l-4 1.2 4 8.8"></path></g><defs><clipPath id="icon-ymal_svg__a"><path fill="#fff" d="M0 0h19.2v19.2H0z"></path></clipPath></defs></svg> <span class="sr-only">View similar</span></div>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (Drawer.Content) {
								$$renderer.push('<!--[-->');

								Drawer.Content($$renderer, {
									class: '',
									children: ($$renderer) => {
										if (Drawer.Header) {
											$$renderer.push('<!--[-->');

											Drawer.Header($$renderer, {
												class: 'text-left',
												children: ($$renderer) => {
													if (Drawer.Title) {
														$$renderer.push('<!--[-->');

														Drawer.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->You May Also Like`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (productState.productsOfSameCategory?.length) {
											$$renderer.push('<!--[0-->');

											if (Carousel.Root) {
												$$renderer.push('<!--[-->');

												Carousel.Root($$renderer, {
													class: 'px-4',
													children: ($$renderer) => {
														if (Carousel.Content) {
															$$renderer.push('<!--[-->');

															Carousel.Content($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array = $.ensure_array_like(productState.productsOfSameCategory);

																	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																		let product = each_array[$$index];

																		if (Carousel.Item) {
																			$$renderer.push('<!--[-->');

																			Carousel.Item($$renderer, {
																				class: 'basis-1/2',
																				onclick: () => {
																					productState.showSimilarDrawer = false;
																				},

																				children: ($$renderer) => {
																					ProductCard($$renderer, { product });
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
																	}

																	$$renderer.push(`<!--]-->`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}