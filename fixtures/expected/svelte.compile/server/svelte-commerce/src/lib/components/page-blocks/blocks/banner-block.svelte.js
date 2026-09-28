import * as $ from 'svelte/internal/server';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { getYoutubeId } from '$lib/core/logic/index.js';
import * as Carousel from '$lib/components/ui/carousel/index.js';
import { onMount } from 'svelte';

export default function Banner_block($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { block } = $$props;

		const $$d = $.derived(() => block.metadata.aspectRatio?.split(':') || ['1', '1']),
			$$derived_array = $.derived(() => $.to_array($$d(), 2)),
			aspectWidth = $.derived(() => $$derived_array()[0]),
			aspectHeight = $.derived(() => $$derived_array()[1]);

		let mainCarouselApi = null;
		let currentIndex = 0;
		const videoURLRegex = /mp4$|webm$/;
		const isVideoURL = (x) => videoURLRegex.test(x);

		onMount(() => {
			if (block.metadata.autoScroll) {
				const intervalId = setInterval(
					() => {
						mainCarouselApi?.scrollTo((currentIndex + 1) % block.metadata.images?.length);
					},
					block.metadata.autoScrollInterval || 2000
				);

				return () => {
					clearInterval(intervalId);
				};
			}
		});

		const flexBasis = $.derived(() => {
			const x = 1 / (block.metadata.viewCount || 1);

			return x * 100;
		});

		$$renderer.push(`<div${$.attr_style(`aspect-ratio: ${$.stringify(aspectWidth())}/${$.stringify(aspectHeight())}; ${block.metadata.maxWidth ? `max-width: ${block.metadata.maxWidth}px;` : ``}`)} class="flex-1">`);

		if (Carousel.Root) {
			$$renderer.push('<!--[-->');

			Carousel.Root($$renderer, {
				opts: { loop: true, align: 'start' },
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

								const each_array = $.ensure_array_like(block.metadata.images || []);

								for (let index = 0, $$length = each_array.length; index < $$length; index++) {
									let img = each_array[index];
									const youtubeId = getYoutubeId(img.file);

									if (Carousel.Item) {
										$$renderer.push('<!--[-->');

										Carousel.Item($$renderer, {
											style: `flex-basis: ${$.stringify(flexBasis())}%; padding-left: ${$.stringify(block.metadata.gridColumnGap ?? 8)}px;`,
											children: ($$renderer) => {
												$$renderer.push(`<div role="button" tabindex="0">`);

												if (youtubeId) {
													$$renderer.push(`<!--[0--><div class="relative aspect-square w-full"><iframe width="100%" height="100%" class="aspect-square"${$.attr('src', `https://www.youtube.com/embed/${$.stringify(youtubeId)}?rel=0&modestbranding=1&playsinline=1`)} title="Video" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" loading="lazy"></iframe></div>`);
												} else if (isVideoURL(img.file)) {
													$$renderer.push(`<!--[1--><video height="100%" width="100%" class="aspect-square w-full" loop="" autoplay="" muted=""><source${$.attr('src', img.file)}/> Video not supported</video>`);
												} else {
													$$renderer.push('<!--[-1-->');

													LazyImg($$renderer, {
														src: img.file,
														aspectRatio: block.metadata.aspectRatio,
														alt: 'Product Image',
														class: 'w-full rounded-radius'
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

					$$renderer.push(` `);

					if (block.metadata.showScrollButtons) {
						$$renderer.push('<!--[0-->');

						if (Carousel.Previous) {
							$$renderer.push('<!--[-->');
							Carousel.Previous($$renderer, { class: '-left-1 md:-left-4' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Carousel.Next) {
							$$renderer.push('<!--[-->');
							Carousel.Next($$renderer, { class: '-right-1 md:-right-4' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (block.metadata.showCarouselIndicators) {
						$$renderer.push(`<!--[0--><div class="mt-3 flex justify-center gap-1.5"><!--[-->`);

						const each_array_1 = $.ensure_array_like(block.metadata.images || []);

						for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
							let _ = each_array_1[i];

							$$renderer.push(`<button${$.attr_class(`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`)}${$.attr('aria-label', `Go to slide ${$.stringify(i + 1)}`)}></button>`);
						}

						$$renderer.push(`<!--]--></div>`);
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

		$$renderer.push(`</div>`);
	});
}