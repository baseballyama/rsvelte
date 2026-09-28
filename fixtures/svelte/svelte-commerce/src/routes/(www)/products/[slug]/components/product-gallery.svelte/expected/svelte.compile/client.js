import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import LazyImgWithZoom from '$lib/core/components/image/lazy-img-with-zoom.svelte';
import * as Carousel from '$lib/components/ui/carousel/index.js';
import { Play, X } from '@lucide/svelte';
import { getSettingState } from '$lib/core/stores/index.js';
import Button from '$lib/components/ui/button/button.svelte';
import { cn } from '$lib/core/utils/index.js';
import { getYoutubeId } from '$lib/core/logic/index.js';
import { page } from '$app/state';

var root = $.from_html(`<style>body {
			overflow: hidden !important;
		}</style>`);

var root_1 = $.from_html(`<iframe width="100%" height="100%" class="aspect-square" title="Video" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" loading="lazy"></iframe>`);
var root_2 = $.from_html(`<video height="100%" width="100%" class="aspect-square w-full" loop="" autoplay=""><source/> Video not supported</video>`, 2);
var root_3 = $.from_html(`<div role="button" tabindex="0" aria-label="View full image"><!></div>`);
var root_4 = $.from_html(`<div class="hidden sm:block"><!> <!></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<div class="relative aspect-square w-full"><iframe width="100%" height="100%" class="aspect-square" title="Video" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" loading="lazy"></iframe></div>`);
var root_7 = $.from_html(`<div class="sm:mb-5 sm:cursor-zoom-in" role="button" tabindex="0"><span class="sr-only">View full-screen gallery</span> <!></div>`);
var root_8 = $.from_html(`<button></button>`);
var root_9 = $.from_html(`<!> <div class="hidden sm:block"><!> <!></div> <div class="mt-4 flex justify-center gap-1.5 sm:hidden"></div>`, 1);
var root_10 = $.from_html(`<span class="sr-only">Close Carousel</span>`);
var root_11 = $.from_html(`<iframe width="100%" height="100%" class="aspect-square rounded-radius" title="Video" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" loading="lazy"></iframe>`);
var root_12 = $.from_html(`<video height="100%" width="100%" class="aspect-square rounded-lg" loop="" autoplay=""><source/> Video not supported</video>`, 2);
var root_13 = $.from_html(`<div><!></div>`);
var root_14 = $.from_html(`<video height="100%" width="100%" class="aspect-square rounded-radius" loop="" autoplay=""><source/> Video not supported</video>`, 2);
var root_15 = $.from_html(`<div class="hidden h-full min-w-[160px] max-w-[160px] flex-none items-center gap-2 overflow-y-auto py-2 scrollbar-thin md:flex md:flex-col"></div>`);
var root_16 = $.from_html(`<!> <div class="flex flex-col-reverse gap-4 sm:flex-row edp-gallery"><div class="hidden sm:flex sm:w-24 sm:flex-col"><!></div> <div class="flex-1"><!></div></div> <div><!> <div class="relative mx-auto flex h-full w-full max-w-[1200px] items-center gap-4 px-4 py-[5vh]"><!> <div class="h-full flex-1 overflow-hidden"><!></div> <!></div></div>`, 1);

export default function Product_gallery($$anchor, $$props) {
	$.push($$props, true);

	let images = $.prop($$props, 'images', 19, () => []);
	let carouselApi = $.state(null);
	let mainCarouselApi = $.state(null);
	let previewCarouselApi = $.state(null);
	let carouselImages = $.state($.proxy([]));
	let currentIndex = $.state(0);
	let previewVideoPaused = $.proxy({});
	let displayCarousel = $.state('hidden');
	let selectedImage = $.state('');
	const settingState = getSettingState();

	const $$d = $.derived(() => page?.data?.store?.productImageAspectRatio?.split(':') || ['1', '1']),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		aspectWidth = $.derived(() => $.get($$array)[0]),
		aspectHeight = $.derived(() => $.get($$array)[1]);

	const onImageClick = (img) => {
		$.set(selectedImage, img, true);
		$.set(currentIndex, images().indexOf(img), true);
	};

	$.user_effect(() => {
		if ($.get(mainCarouselApi) && $.get(mainCarouselApi).selectedScrollSnap() !== $.get(currentIndex)) {
			$.get(mainCarouselApi).scrollTo($.get(currentIndex));
		}

		if ($.get(previewCarouselApi) && $.get(previewCarouselApi).selectedScrollSnap() !== $.get(currentIndex)) {
			$.get(previewCarouselApi).scrollTo($.get(currentIndex));
		}
	});

	const rearrangeArray = (selectedItem, items) => {
		const index = items.indexOf(selectedItem);

		if (index !== -1) {
			return [...items.slice(index), ...items.slice(0, index)];
		}

		return items;
	};

	const showCarousel = (img) => {
		$.set(carouselImages, images(), true);
		$.set(displayCarousel, 'flex');

		const index = images().indexOf(img);

		$.set(currentIndex, index, true);
		$.set(selectedImage, img, true);

		setTimeout(
			() => {
				if ($.get(carouselApi)) {
					$.get(carouselApi).scrollTo(index, true);
				}
			},
			0
		);
	};

	const hideCarousel = () => {
		$.set(displayCarousel, 'hidden');
	};

	const videoURLRegex = /mp4$|webm$/;
	const isVideoURL = (x) => videoURLRegex.test(x);
	var fragment = root_16();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var style = root();

			$.append($$anchor, style);
		};

		$.if(node, ($$render) => {
			if ($.get(displayCarousel) !== 'hidden') $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	$.component(node_1, () => Carousel.Root, ($$anchor, Carousel_Root) => {
		Carousel_Root($$anchor, {
			opts: { align: 'start', loop: true },
			orientation: 'vertical',
			setApi: (api) => {
				if (api) {
					$.set(previewCarouselApi, api, true);
				}
			},
			class: 'relative w-full h-[480px]',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_5();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => Carousel.Content, ($$anchor, Carousel_Content) => {
					Carousel_Content($$anchor, {
						class: '-mt-2 h-[480px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.each(node_3, 17, images, $.index, ($$anchor, img, idx) => {
								const youtubeId = $.derived(() => getYoutubeId($.get(img)));
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Carousel.Item, ($$anchor, Carousel_Item) => {
									Carousel_Item($$anchor, {
										class: 'pt-2 basis-1/5',
										children: ($$anchor, $$slotProps) => {
											var div_2 = root_3();
											var node_5 = $.child(div_2);

											{
												var consequent_1 = ($$anchor) => {
													var iframe = root_1();

													$.template_effect(() => $.set_attribute(iframe, 'src', `https://www.youtube.com/embed/${$.get(youtubeId) ?? ''}?rel=0&modestbranding=1&playsinline=1`));
													$.append($$anchor, iframe);
												};

												var consequent_2 = ($$anchor) => {
													var video = root_2();
													var source = $.child(video);

													$.next();
													$.reset(video);
													$.template_effect(() => $.set_attribute(source, 'src', $.get(img)));
													$.append($$anchor, video);
												};

												var d = $.derived(() => isVideoURL($.get(img)));

												var alternate = ($$anchor) => {
													var fragment_4 = $.comment();
													var node_6 = $.first_child(fragment_4);

													$.key(node_6, () => $.get(img), ($$anchor) => {
														{
															let $0 = $.derived(() => `${page.data?.product?.title || page.data?.product?.name || 'Product'} - Thumbnail ${idx + 1}`);

															LazyImg($$anchor, {
																get src() {
																	return $.get(img);
																},

																get alt() {
																	return $.get($0);
																},
																class: 'w-full rounded-radius object-cover',
																sizes: '96px'
															});
														}
													});

													$.append($$anchor, fragment_4);
												};

												$.if(node_5, ($$render) => {
													if ($.get(youtubeId)) $$render(consequent_1); else if ($.get(d)) $$render(consequent_2, 1); else $$render(alternate, -1);
												});
											}

											$.reset(div_2);

											$.template_effect(($0) => $.set_class(div_2, 1, $0), [
												() => $.clsx(cn('relative overflow-hidden rounded-radius border p-0.5 w-full aspect-square', idx === $.get(currentIndex) ? 'border-primary' : 'border-muted'))
											]);

											$.delegated('click', div_2, () => onImageClick?.($.get(img)));
											$.delegated('keydown', div_2, (e) => e.key === 'Enter' && onImageClick?.($.get(img)));
											$.append($$anchor, div_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_2, 2);

				{
					var consequent_3 = ($$anchor) => {
						var div_3 = root_4();
						var node_8 = $.child(div_3);

						$.component(node_8, () => Carousel.Previous, ($$anchor, Carousel_Previous) => {
							Carousel_Previous($$anchor, {
								class: '-top-4 left-1/2 -translate-x-1/2 rotate-90 size-7 [&>svg]:size-3.5'
							});
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => Carousel.Next, ($$anchor, Carousel_Next) => {
							Carousel_Next($$anchor, {
								class: '-bottom-4 left-1/2 -translate-x-1/2 rotate-90 size-7 [&>svg]:size-3.5'
							});
						});

						$.reset(div_3);
						$.append($$anchor, div_3);
					};

					$.if(node_7, ($$render) => {
						if (images().length > 4) $$render(consequent_3);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var node_10 = $.child(div_4);

	$.component(node_10, () => Carousel.Root, ($$anchor, Carousel_Root_1) => {
		Carousel_Root_1($$anchor, {
			opts: { loop: true },
			setApi: (api) => {
				if (api) {
					$.set(mainCarouselApi, api, true);

					api.on('select', () => {
						$.set(currentIndex, api.selectedScrollSnap(), true);
					});
				}
			},
			class: 'relative w-full',
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_9();
				var node_11 = $.first_child(fragment_6);

				$.component(node_11, () => Carousel.Content, ($$anchor, Carousel_Content_1) => {
					Carousel_Content_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_12 = $.first_child(fragment_7);

							$.each(node_12, 17, images, $.index, ($$anchor, img, index) => {
								const youtubeId = $.derived(() => getYoutubeId($.get(img)));
								var fragment_8 = $.comment();
								var node_13 = $.first_child(fragment_8);

								$.component(node_13, () => Carousel.Item, ($$anchor, Carousel_Item_1) => {
									Carousel_Item_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var div_5 = root_7();
											var node_14 = $.sibling($.child(div_5), 2);

											{
												var consequent_4 = ($$anchor) => {
													var div_6 = root_6();
													var iframe_1 = $.only_child(div_6);

													$.template_effect(() => $.set_attribute(iframe_1, 'src', `https://www.youtube.com/embed/${$.get(youtubeId) ?? ''}?rel=0&modestbranding=1&playsinline=1`));
													$.append($$anchor, div_6);
												};

												var consequent_5 = ($$anchor) => {
													var video_1 = root_2();

													video_1.muted = true;

													var source_1 = $.child(video_1);

													$.next();
													$.reset(video_1);
													$.template_effect(() => $.set_attribute(source_1, 'src', $.get(img)));
													$.append($$anchor, video_1);
												};

												var d_1 = $.derived(() => isVideoURL($.get(img)));

												var alternate_1 = ($$anchor) => {
													var fragment_9 = $.comment();
													var node_15 = $.first_child(fragment_9);

													$.key(node_15, () => $.get(img), ($$anchor) => {
														{
															let $0 = $.derived(() => `${page.data?.product?.title || page.data?.product?.name || 'Product Image'} - View ${index + 1}`);

															LazyImgWithZoom($$anchor, {
																get src() {
																	return $.get(img);
																},

																get alt() {
																	return $.get($0);
																},
																class: 'w-full rounded-radius object-contain',
																priority: index === 0
															});
														}
													});

													$.append($$anchor, fragment_9);
												};

												$.if(node_14, ($$render) => {
													if ($.get(youtubeId)) $$render(consequent_4); else if ($.get(d_1)) $$render(consequent_5, 1); else $$render(alternate_1, -1);
												});
											}

											$.reset(div_5);
											$.delegated('click', div_5, () => showCarousel($.get(img)));
											$.delegated('keydown', div_5, (e) => e.key === 'Enter' && showCarousel($.get(img)));
											$.append($$anchor, div_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				var div_7 = $.sibling(node_11, 2);
				var node_16 = $.child(div_7);

				$.component(node_16, () => Carousel.Previous, ($$anchor, Carousel_Previous_1) => {
					Carousel_Previous_1($$anchor, { class: '-left-4 size-7 [&>svg]:size-3.5' });
				});

				var node_17 = $.sibling(node_16, 2);

				$.component(node_17, () => Carousel.Next, ($$anchor, Carousel_Next_1) => {
					Carousel_Next_1($$anchor, { class: '-right-4 size-7 [&>svg]:size-3.5' });
				});

				$.reset(div_7);

				var div_8 = $.sibling(div_7, 2);

				$.each(div_8, 21, images, $.index, ($$anchor, _, i) => {
					var button = root_8();

					$.set_attribute(button, 'aria-label', `Go to slide ${i + 1}`);
					$.template_effect(() => $.set_class(button, 1, `h-1.5 rounded-full transition-all duration-300 ${$.get(currentIndex) === i ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300'}`));
					$.delegated('click', button, () => $.get(mainCarouselApi)?.scrollTo(i));
					$.append($$anchor, button);
				});

				$.reset(div_8);
				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_4);
	$.reset(div);

	var div_9 = $.sibling(div, 2);
	var node_18 = $.child(div_9);

	Button(node_18, {
		variant: 'ghost',
		class: 'absolute left-0 top-0 h-full w-full rounded-none hover:bg-transparent',
		onclick: hideCarousel,
		children: ($$anchor, $$slotProps) => {
			var span = root_10();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	var div_10 = $.sibling(node_18, 2);
	var node_19 = $.child(div_10);

	Button(node_19, {
		variant: 'plain',
		size: 'icon',
		class: 'absolute right-0 top-4 z-30 rounded-full text-white hover:border hover:border-primary hover:bg-white/10',
		onclick: hideCarousel,
		children: ($$anchor, $$slotProps) => {
			X($$anchor, { class: 'h-6 w-6' });
		},
		$$slots: { default: true }
	});

	var div_11 = $.sibling(node_19, 2);
	var node_20 = $.child(div_11);

	$.component(node_20, () => Carousel.Root, ($$anchor, Carousel_Root_2) => {
		Carousel_Root_2($$anchor, {
			opts: { loop: true },
			setApi: (api) => {
				if (api) {
					$.set(carouselApi, api, true);

					api.on('select', () => {
						$.set(currentIndex, api.selectedScrollSnap(), true);
						$.set(selectedImage, $.get(carouselImages)[$.get(currentIndex)], true);
					});
				}
			},
			class: 'relative h-full w-full',
			children: ($$anchor, $$slotProps) => {
				var fragment_12 = $.comment();
				var node_21 = $.first_child(fragment_12);

				$.component(node_21, () => Carousel.Content, ($$anchor, Carousel_Content_2) => {
					Carousel_Content_2($$anchor, {
						class: 'h-full',
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = $.comment();
							var node_22 = $.first_child(fragment_13);

							$.each(node_22, 17, () => $.get(carouselImages) || [], $.index, ($$anchor, img, index) => {
								const youtubeId = $.derived(() => getYoutubeId($.get(img)));
								var fragment_14 = $.comment();
								var node_23 = $.first_child(fragment_14);

								$.component(node_23, () => Carousel.Item, ($$anchor, Carousel_Item_2) => {
									Carousel_Item_2($$anchor, {
										class: '',
										children: ($$anchor, $$slotProps) => {
											var div_12 = root_13();
											var node_24 = $.child(div_12);

											{
												var consequent_6 = ($$anchor) => {
													var iframe_2 = root_11();

													$.template_effect(() => $.set_attribute(iframe_2, 'src', `https://www.youtube.com/embed/${$.get(youtubeId) ?? ''}?rel=0&modestbranding=1&playsinline=1`));
													$.append($$anchor, iframe_2);
												};

												var consequent_7 = ($$anchor) => {
													var video_2 = root_12();
													var source_2 = $.child(video_2);

													$.next();
													$.reset(video_2);
													$.template_effect(() => $.set_attribute(source_2, 'src', $.get(img)));
													$.append($$anchor, video_2);
												};

												var d_2 = $.derived(() => isVideoURL($.get(img)));

												var alternate_2 = ($$anchor) => {
													{
														let $0 = $.derived(() => `${page.data?.product?.title || page.data?.product?.name || 'Product Image'} - View ${index + 1}`);

														LazyImg($$anchor, {
															get src() {
																return $.get(img);
															},

															get alt() {
																return $.get($0);
															},
															class: 'max-h-[90vh]'
														});
													}
												};

												$.if(node_24, ($$render) => {
													if ($.get(youtubeId)) $$render(consequent_6); else if ($.get(d_2)) $$render(consequent_7, 1); else $$render(alternate_2, -1);
												});
											}

											$.reset(div_12);
											$.append($$anchor, div_12);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_14);
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_12);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_11);

	var node_25 = $.sibling(div_11, 2);

	{
		var consequent_9 = ($$anchor) => {
			var div_13 = root_15();

			$.each(div_13, 21, () => $.get(carouselImages) || [], $.index, ($$anchor, img, i) => {
				const youtubeId = $.derived(() => getYoutubeId($.get(img)));

				{
					let $0 = $.derived(() => $.get(currentIndex) === i
						? 'ring-2 ring-primary ring-offset-2 ring-offset-black'
						: '');

					Button($$anchor, {
						variant: 'ghost',
						get style() {
							return `aspect-ratio: ${$.get(aspectWidth) ?? ''}/${$.get(aspectHeight) ?? ''};`;
						},

						get class() {
							return `relative h-24  overflow-hidden rounded-radius p-0 ${$.get($0) ?? ''}`;
						},

						onclick: () => {
							if ($.get(carouselApi)) {
								$.get(carouselApi).scrollTo(i);
								$.set(currentIndex, i, true);
								$.set(selectedImage, $.get(img), true);
							}
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_17 = $.comment();
							var node_26 = $.first_child(fragment_17);

							{
								var consequent_8 = ($$anchor) => {
									var video_3 = root_14();
									var source_3 = $.child(video_3);

									$.next();
									$.reset(video_3);
									$.template_effect(() => $.set_attribute(source_3, 'src', $.get(img)));
									$.append($$anchor, video_3);
								};

								var d_3 = $.derived(() => isVideoURL($.get(img)));

								var alternate_3 = ($$anchor) => {
									{
										let $0 = $.derived(() => $.get(youtubeId)
											? `https://img.youtube.com/vi/${$.get(youtubeId)}/default.jpg`
											: $.get(img));

										let $1 = $.derived(() => `${page.data?.product?.title || page.data?.product?.name || 'Product'} - Gallery Thumbnail ${i + 1}`);

										LazyImg($$anchor, {
											get src() {
												return $.get($0);
											},

											get alt() {
												return $.get($1);
											},
											class: 'h-full w-full rounded-radius object-contain',
											sizes: '96px'
										});
									}
								};

								$.if(node_26, ($$render) => {
									if ($.get(d_3)) $$render(consequent_8); else $$render(alternate_3, -1);
								});
							}

							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					});
				}
			});

			$.reset(div_13);
			$.append($$anchor, div_13);
		};

		$.if(node_25, ($$render) => {
			if ($.get(carouselImages)?.length > 0) $$render(consequent_9);
		});
	}

	$.reset(div_10);
	$.reset(div_9);
	$.template_effect(() => $.set_class(div_9, 1, `fixed left-0 top-0 z-[100] ${$.get(displayCarousel) ?? ''} h-[100dvh] w-screen flex-col items-center justify-start overflow-hidden bg-black`));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);