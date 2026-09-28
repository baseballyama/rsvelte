import * as $ from 'svelte/internal/server';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import LazyImgWithZoom from '$lib/core/components/image/lazy-img-with-zoom.svelte';
import * as Carousel from '$lib/components/ui/carousel/index.js';
import { Play, X } from '@lucide/svelte';
import { getSettingState } from '$lib/core/stores/index.js';
import Button from '$lib/components/ui/button/button.svelte';
import { cn } from '$lib/core/utils/index.js';
import { getYoutubeId } from '$lib/core/logic/index.js';
import { page } from '$app/state';

export default function Product_gallery($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { images = [] } = $$props;
		let carouselApi = null;
		let mainCarouselApi = null;
		let previewCarouselApi = null;
		let carouselImages = [];
		let currentIndex = 0;
		let previewVideoPaused = {};
		let displayCarousel = 'hidden';
		let selectedImage = '';
		const settingState = getSettingState();

		const $$d = $.derived(() => page?.data?.store?.productImageAspectRatio?.split(':') || ['1', '1']),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			aspectWidth = $.derived(() => $$derived_array()[0]),
			aspectHeight = $.derived(() => $$derived_array()[1]);

		const onImageClick = (img) => {
			selectedImage = img;
			currentIndex = images.indexOf(img);
		};

		const rearrangeArray = (selectedItem, items) => {
			const index = items.indexOf(selectedItem);

			if (index !== -1) {
				return [...items.slice(index), ...items.slice(0, index)];
			}

			return items;
		};

		const showCarousel = (img) => {
			carouselImages = images;
			displayCarousel = 'flex';

			const index = images.indexOf(img);

			currentIndex = index;
			selectedImage = img;

			setTimeout(
				() => {
					if (carouselApi) {
						carouselApi.scrollTo(index, true);
					}
				},
				0
			);
		};

		const hideCarousel = () => {
			displayCarousel = 'hidden';
		};

		const videoURLRegex = /mp4$|webm$/;
		const isVideoURL = (x) => videoURLRegex.test(x);

		if (displayCarousel !== 'hidden') {
			$$renderer.push(`<!--[0--><style>
		body {
			overflow: hidden !important;
		}
	</style>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="flex flex-col-reverse gap-4 sm:flex-row edp-gallery"><div class="hidden sm:flex sm:w-24 sm:flex-col">`);

		if (Carousel.Root) {
			$$renderer.push('<!--[-->');

			Carousel.Root($$renderer, {
				opts: { align: 'start', loop: true },
				orientation: 'vertical',
				setApi: (api) => {
					if (api) {
						previewCarouselApi = api;
					}
				},
				class: 'relative w-full h-[480px]',
				children: ($$renderer) => {
					if (Carousel.Content) {
						$$renderer.push('<!--[-->');

						Carousel.Content($$renderer, {
							class: '-mt-2 h-[480px]',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(images);

								for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
									let img = each_array[idx];
									const youtubeId = getYoutubeId(img);

									if (Carousel.Item) {
										$$renderer.push('<!--[-->');

										Carousel.Item($$renderer, {
											class: 'pt-2 basis-1/5',
											children: ($$renderer) => {
												$$renderer.push(`<div${$.attr_class($.clsx(cn('relative overflow-hidden rounded-radius border p-0.5 w-full aspect-square', idx === currentIndex ? 'border-primary' : 'border-muted')))} role="button" tabindex="0" aria-label="View full image">`);

												if (youtubeId) {
													$$renderer.push(`<!--[0--><iframe width="100%" height="100%" class="aspect-square"${$.attr('src', `https://www.youtube.com/embed/${$.stringify(youtubeId)}?rel=0&modestbranding=1&playsinline=1`)} title="Video" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" loading="lazy"></iframe>`);
												} else if (isVideoURL(img)) {
													$$renderer.push(`<!--[1--><video height="100%" width="100%" class="aspect-square w-full" loop="" autoplay=""><source${$.attr('src', img)}/> Video not supported</video>`);
												} else {
													$$renderer.push(`<!--[-1--><!---->`);

													{
														LazyImg($$renderer, {
															src: img,
															alt: `${page.data?.product?.title || page.data?.product?.name || 'Product'} - Thumbnail ${idx + 1}`,
															class: 'w-full rounded-radius object-cover',
															sizes: '96px'
														});
													}

													$$renderer.push(`<!---->`);
												}

												$$renderer.push(`<!--]--></div>`);
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

					$$renderer.push(` `);

					if (images.length > 4) {
						$$renderer.push(`<!--[0--><div class="hidden sm:block">`);

						if (Carousel.Previous) {
							$$renderer.push('<!--[-->');

							Carousel.Previous($$renderer, {
								class: '-top-4 left-1/2 -translate-x-1/2 rotate-90 size-7 [&>svg]:size-3.5'
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Carousel.Next) {
							$$renderer.push('<!--[-->');

							Carousel.Next($$renderer, {
								class: '-bottom-4 left-1/2 -translate-x-1/2 rotate-90 size-7 [&>svg]:size-3.5'
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div>`);
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

		$$renderer.push(`</div> <div class="flex-1">`);

		if (Carousel.Root) {
			$$renderer.push('<!--[-->');

			Carousel.Root($$renderer, {
				opts: { loop: true },
				setApi: (api) => {
					if (api) {
						mainCarouselApi = api;

						api.on('select', () => {
							currentIndex = api.selectedScrollSnap();
						});
					}
				},
				class: 'relative w-full',
				children: ($$renderer) => {
					if (Carousel.Content) {
						$$renderer.push('<!--[-->');

						Carousel.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(images);

								for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
									let img = each_array_1[index];
									const youtubeId = getYoutubeId(img);

									if (Carousel.Item) {
										$$renderer.push('<!--[-->');

										Carousel.Item($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<div class="sm:mb-5 sm:cursor-zoom-in" role="button" tabindex="0"><span class="sr-only">View full-screen gallery</span> `);

												if (youtubeId) {
													$$renderer.push(`<!--[0--><div class="relative aspect-square w-full"><iframe width="100%" height="100%" class="aspect-square"${$.attr('src', `https://www.youtube.com/embed/${$.stringify(youtubeId)}?rel=0&modestbranding=1&playsinline=1`)} title="Video" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" loading="lazy"></iframe></div>`);
												} else if (isVideoURL(img)) {
													$$renderer.push(`<!--[1--><video height="100%" width="100%" class="aspect-square w-full" loop="" autoplay="" muted=""><source${$.attr('src', img)}/> Video not supported</video>`);
												} else {
													$$renderer.push(`<!--[-1--><!---->`);

													{
														LazyImgWithZoom($$renderer, {
															src: img,
															alt: `${page.data?.product?.title || page.data?.product?.name || 'Product Image'} - View ${index + 1}`,
															class: 'w-full rounded-radius object-contain',
															priority: index === 0
														});
													}

													$$renderer.push(`<!---->`);
												}

												$$renderer.push(`<!--]--></div>`);
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

					$$renderer.push(` <div class="hidden sm:block">`);

					if (Carousel.Previous) {
						$$renderer.push('<!--[-->');
						Carousel.Previous($$renderer, { class: '-left-4 size-7 [&>svg]:size-3.5' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Carousel.Next) {
						$$renderer.push('<!--[-->');
						Carousel.Next($$renderer, { class: '-right-4 size-7 [&>svg]:size-3.5' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> <div class="mt-4 flex justify-center gap-1.5 sm:hidden"><!--[-->`);

					const each_array_2 = $.ensure_array_like(images);

					for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
						let _ = each_array_2[i];

						$$renderer.push(`<button${$.attr_class(`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300'}`)}${$.attr('aria-label', `Go to slide ${$.stringify(i + 1)}`)}></button>`);
					}

					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div></div> <div${$.attr_class(`fixed left-0 top-0 z-[100] ${$.stringify(displayCarousel)} h-[100dvh] w-screen flex-col items-center justify-start overflow-hidden bg-black`)}>`);

		Button($$renderer, {
			variant: 'ghost',
			class: 'absolute left-0 top-0 h-full w-full rounded-none hover:bg-transparent',
			onclick: hideCarousel,
			children: ($$renderer) => {
				$$renderer.push(`<span class="sr-only">Close Carousel</span>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="relative mx-auto flex h-full w-full max-w-[1200px] items-center gap-4 px-4 py-[5vh]">`);

		Button($$renderer, {
			variant: 'plain',
			size: 'icon',
			class: 'absolute right-0 top-4 z-30 rounded-full text-white hover:border hover:border-primary hover:bg-white/10',
			onclick: hideCarousel,
			children: ($$renderer) => {
				X($$renderer, { class: 'h-6 w-6' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <div class="h-full flex-1 overflow-hidden">`);

		if (Carousel.Root) {
			$$renderer.push('<!--[-->');

			Carousel.Root($$renderer, {
				opts: { loop: true },
				setApi: (api) => {
					if (api) {
						carouselApi = api;

						api.on('select', () => {
							currentIndex = api.selectedScrollSnap();
							selectedImage = carouselImages[currentIndex];
						});
					}
				},
				class: 'relative h-full w-full',
				children: ($$renderer) => {
					if (Carousel.Content) {
						$$renderer.push('<!--[-->');

						Carousel.Content($$renderer, {
							class: 'h-full',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_3 = $.ensure_array_like(carouselImages || []);

								for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
									let img = each_array_3[index];
									const youtubeId = getYoutubeId(img);

									if (Carousel.Item) {
										$$renderer.push('<!--[-->');

										Carousel.Item($$renderer, {
											class: '',
											children: ($$renderer) => {
												$$renderer.push(`<div>`);

												if (youtubeId) {
													$$renderer.push(`<!--[0--><iframe width="100%" height="100%" class="aspect-square rounded-radius"${$.attr('src', `https://www.youtube.com/embed/${$.stringify(youtubeId)}?rel=0&modestbranding=1&playsinline=1`)} title="Video" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" loading="lazy"></iframe>`);
												} else if (isVideoURL(img)) {
													$$renderer.push(`<!--[1--><video height="100%" width="100%" class="aspect-square rounded-lg" loop="" autoplay=""><source${$.attr('src', img)}/> Video not supported</video>`);
												} else {
													$$renderer.push('<!--[-1-->');

													LazyImg($$renderer, {
														src: img,
														alt: `${page.data?.product?.title || page.data?.product?.name || 'Product Image'} - View ${index + 1}`,
														class: 'max-h-[90vh]'
													});
												}

												$$renderer.push(`<!--]--></div>`);
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

		$$renderer.push(`</div> `);

		if (carouselImages?.length > 0) {
			$$renderer.push(`<!--[0--><div class="hidden h-full min-w-[160px] max-w-[160px] flex-none items-center gap-2 overflow-y-auto py-2 scrollbar-thin md:flex md:flex-col"><!--[-->`);

			const each_array_4 = $.ensure_array_like(carouselImages || []);

			for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
				let img = each_array_4[i];
				const youtubeId = getYoutubeId(img);

				Button($$renderer, {
					variant: 'ghost',
					style: `aspect-ratio: ${$.stringify(aspectWidth())}/${$.stringify(aspectHeight())};`,
					class: `relative h-24  overflow-hidden rounded-radius p-0 ${currentIndex === i
						? 'ring-2 ring-primary ring-offset-2 ring-offset-black'
						: ''}`,

					onclick: () => {
						if (carouselApi) {
							carouselApi.scrollTo(i);
							currentIndex = i;
							selectedImage = img;
						}
					},

					children: ($$renderer) => {
						if (isVideoURL(img)) {
							$$renderer.push(`<!--[0--><video height="100%" width="100%" class="aspect-square rounded-radius" loop="" autoplay=""><source${$.attr('src', img)}/> Video not supported</video>`);
						} else {
							$$renderer.push('<!--[-1-->');

							LazyImg($$renderer, {
								src: youtubeId
									? `https://img.youtube.com/vi/${youtubeId}/default.jpg`
									: img,
								alt: `${page.data?.product?.title || page.data?.product?.name || 'Product'} - Gallery Thumbnail ${i + 1}`,
								class: 'h-full w-full rounded-radius object-contain',
								sizes: '96px'
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}