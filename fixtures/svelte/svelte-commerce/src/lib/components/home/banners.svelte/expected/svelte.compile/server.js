import * as $ from 'svelte/internal/server';
import Autoplay from 'embla-carousel-autoplay';
import * as Carousel from '$lib/components/ui/carousel';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { goto } from '$app/navigation';

export default function Banners($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { sliderBannersDesktop, sliderBannersMobile } = $$props;
		const isVideoURL = (url) => (/\.(mp4|webm|mkv)$/).test(url);

		$$renderer.push(`<div class="hidden sm:block">`);

		if (Carousel.Root) {
			$$renderer.push('<!--[-->');

			Carousel.Root($$renderer, {
				opts: { align: 'start', loop: true },
				plugins: [Autoplay({ delay: 10000 })],
				children: ($$renderer) => {
					if (Carousel.Content) {
						$$renderer.push('<!--[-->');

						Carousel.Content($$renderer, {
							class: '-ml-5',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(sliderBannersDesktop);

								for (let ix = 0, $$length = each_array.length; ix < $$length; ix++) {
									let b = each_array[ix];

									if (Carousel.Item) {
										$$renderer.push('<!--[-->');

										Carousel.Item($$renderer, {
											class: '',
											children: ($$renderer) => {
												$$renderer.push(`<div class="relative w-full overflow-hidden rounded-none shadow-2xl">`);

												if (b.url) {
													$$renderer.push(`<!--[0--><a${$.attr('href', b.link)} aria-label="Click to visit banner related products page" class="group block h-full" data-sveltekit-preload-data="">`);

													if (isVideoURL(b.url)) {
														$$renderer.push(`<!--[0--><video class="w-full object-cover"${$.attr('src', b.url)} loop="" autoplay="" muted="" playsinline=""><track kind="captions"/> <p>Video playback not supported</p></video>`);
													} else {
														$$renderer.push(`<!--[-1--><div class="relative overflow-hidden">`);

														LazyImg($$renderer, {
															aspectRatio: 'auto:auto',
															src: b.url,
															alt: `Promotional Banner ${$.stringify(ix + 1)} - Shop the latest collection`,
															class: 'w-full object-cover',
															fetchpriority: ix === 0 ? 'high' : 'auto',
															loading: ix === 0 ? 'eager' : 'lazy'
														});

														$$renderer.push(`<!----></div>`);
													}

													$$renderer.push(`<!--]--></a>`);
												} else {
													$$renderer.push('<!--[-1-->');
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

		$$renderer.push(`</div> <div class="block max-h-[900px] sm:hidden">`);

		if (Carousel.Root) {
			$$renderer.push('<!--[-->');

			Carousel.Root($$renderer, {
				opts: { align: 'start', loop: true },
				plugins: [Autoplay({ delay: 10000 })],
				children: ($$renderer) => {
					if (Carousel.Content) {
						$$renderer.push('<!--[-->');

						Carousel.Content($$renderer, {
							class: '-ml-5',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(sliderBannersMobile);

								for (let ix = 0, $$length = each_array_1.length; ix < $$length; ix++) {
									let b = each_array_1[ix];

									if (Carousel.Item) {
										$$renderer.push('<!--[-->');

										Carousel.Item($$renderer, {
											class: 'h-full',
											children: ($$renderer) => {
												$$renderer.push(`<div class="relative w-full overflow-hidden rounded-none shadow-lg">`);

												if (b.url) {
													$$renderer.push(`<!--[0--><a${$.attr('href', b.link)} aria-label="Click to visit banner related products page" class="group block h-full" data-sveltekit-preload-data="">`);

													if (isVideoURL(b.url)) {
														$$renderer.push(`<!--[0--><video class="w-full object-cover"${$.attr('src', b.url)} loop="" autoplay="" muted="" playsinline=""><track kind="captions"/> <p>Video playback not supported</p></video>`);
													} else {
														$$renderer.push(`<!--[-1--><div class="relative">`);

														LazyImg($$renderer, {
															src: b.url,
															aspectRatio: 'auto:auto',
															alt: `Promotional Mobile Banner ${$.stringify(ix + 1)} - Exclusive Deals`,
															class: 'h-full w-full object-cover',
															fetchpriority: ix === 0 ? 'high' : 'auto',
															loading: ix === 0 ? 'eager' : 'lazy'
														});

														$$renderer.push(`<!----></div>`);
													}

													$$renderer.push(`<!--]--></a>`);
												} else {
													$$renderer.push('<!--[-1-->');
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

		$$renderer.push(`</div>`);
	});
}