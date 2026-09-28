import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Autoplay from 'embla-carousel-autoplay';
import * as Carousel from '$lib/components/ui/carousel';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { goto } from '$app/navigation';

var root = $.from_html(`<video class="w-full object-cover" loop="" autoplay="" playsinline=""><track kind="captions"/> <p>Video playback not supported</p></video>`, 2);
var root_1 = $.from_html(`<div class="relative overflow-hidden"><!></div>`);
var root_2 = $.from_html(`<a aria-label="Click to visit banner related products page" class="group block h-full" data-sveltekit-preload-data=""><!></a>`);
var root_3 = $.from_html(`<div class="relative w-full overflow-hidden rounded-none shadow-2xl"><!></div>`);
var root_4 = $.from_html(`<div class="relative"><!></div>`);
var root_5 = $.from_html(`<div class="relative w-full overflow-hidden rounded-none shadow-lg"><!></div>`);
var root_6 = $.from_html(`<div class="hidden sm:block"><!></div> <div class="block max-h-[900px] sm:hidden"><!></div>`, 1);

export default function Banners($$anchor, $$props) {
	$.push($$props, true);

	const isVideoURL = (url) => (/\.(mp4|webm|mkv)$/).test(url);
	var fragment = root_6();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		let $0 = $.derived(() => [Autoplay({ delay: 10000 })]);

		$.component(node, () => Carousel.Root, ($$anchor, Carousel_Root) => {
			Carousel_Root($$anchor, {
				opts: { align: 'start', loop: true },
				get plugins() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => Carousel.Content, ($$anchor, Carousel_Content) => {
						Carousel_Content($$anchor, {
							class: '-ml-5',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								$.each(node_2, 17, () => $$props.sliderBannersDesktop, $.index, ($$anchor, b, ix) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Carousel.Item, ($$anchor, Carousel_Item) => {
										Carousel_Item($$anchor, {
											class: '',
											children: ($$anchor, $$slotProps) => {
												var div_1 = root_3();
												var node_4 = $.child(div_1);

												{
													var consequent_1 = ($$anchor) => {
														var a = root_2();
														var node_5 = $.child(a);

														{
															var consequent = ($$anchor) => {
																var video = root();

																video.muted = true;
																$.template_effect(() => $.set_attribute(video, 'src', $.get(b).url));
																$.append($$anchor, video);
															};

															var d = $.derived(() => isVideoURL($.get(b).url));

															var alternate = ($$anchor) => {
																var div_2 = root_1();
																var node_6 = $.child(div_2);

																LazyImg(node_6, {
																	aspectRatio: 'auto:auto',
																	get src() {
																		return $.get(b).url;
																	},
																	alt: `Promotional Banner ${ix + 1} - Shop the latest collection`,
																	class: 'w-full object-cover',
																	fetchpriority: ix === 0 ? 'high' : 'auto',
																	loading: ix === 0 ? 'eager' : 'lazy'
																});

																$.reset(div_2);
																$.append($$anchor, div_2);
															};

															$.if(node_5, ($$render) => {
																if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
															});
														}

														$.reset(a);
														$.template_effect(() => $.set_attribute(a, 'href', $.get(b).link));
														$.append($$anchor, a);
													};

													$.if(node_4, ($$render) => {
														if ($.get(b).url) $$render(consequent_1);
													});
												}

												$.reset(div_1);
												$.append($$anchor, div_1);
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

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.reset(div);

	var div_3 = $.sibling(div, 2);
	var node_7 = $.child(div_3);

	{
		let $0 = $.derived(() => [Autoplay({ delay: 10000 })]);

		$.component(node_7, () => Carousel.Root, ($$anchor, Carousel_Root_1) => {
			Carousel_Root_1($$anchor, {
				opts: { align: 'start', loop: true },
				get plugins() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = $.comment();
					var node_8 = $.first_child(fragment_4);

					$.component(node_8, () => Carousel.Content, ($$anchor, Carousel_Content_1) => {
						Carousel_Content_1($$anchor, {
							class: '-ml-5',
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = $.comment();
								var node_9 = $.first_child(fragment_5);

								$.each(node_9, 17, () => $$props.sliderBannersMobile, $.index, ($$anchor, b, ix) => {
									var fragment_6 = $.comment();
									var node_10 = $.first_child(fragment_6);

									$.component(node_10, () => Carousel.Item, ($$anchor, Carousel_Item_1) => {
										Carousel_Item_1($$anchor, {
											class: 'h-full',
											children: ($$anchor, $$slotProps) => {
												var div_4 = root_5();
												var node_11 = $.child(div_4);

												{
													var consequent_3 = ($$anchor) => {
														var a_1 = root_2();
														var node_12 = $.child(a_1);

														{
															var consequent_2 = ($$anchor) => {
																var video_1 = root();

																video_1.muted = true;
																$.template_effect(() => $.set_attribute(video_1, 'src', $.get(b).url));
																$.append($$anchor, video_1);
															};

															var d_1 = $.derived(() => isVideoURL($.get(b).url));

															var alternate_1 = ($$anchor) => {
																var div_5 = root_4();
																var node_13 = $.child(div_5);

																LazyImg(node_13, {
																	get src() {
																		return $.get(b).url;
																	},
																	aspectRatio: 'auto:auto',
																	alt: `Promotional Mobile Banner ${ix + 1} - Exclusive Deals`,
																	class: 'h-full w-full object-cover',
																	fetchpriority: ix === 0 ? 'high' : 'auto',
																	loading: ix === 0 ? 'eager' : 'lazy'
																});

																$.reset(div_5);
																$.append($$anchor, div_5);
															};

															$.if(node_12, ($$render) => {
																if ($.get(d_1)) $$render(consequent_2); else $$render(alternate_1, -1);
															});
														}

														$.reset(a_1);
														$.template_effect(() => $.set_attribute(a_1, 'href', $.get(b).link));
														$.append($$anchor, a_1);
													};

													$.if(node_11, ($$render) => {
														if ($.get(b).url) $$render(consequent_3);
													});
												}

												$.reset(div_4);
												$.append($$anchor, div_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		});
	}

	$.reset(div_3);
	$.append($$anchor, fragment);
	$.pop();
}