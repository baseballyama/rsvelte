import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { getYoutubeId } from '$lib/core/logic/index.js';
import * as Carousel from '$lib/components/ui/carousel/index.js';
import { onMount } from 'svelte';

var root = $.from_html(`<div class="relative aspect-square w-full"><iframe width="100%" height="100%" class="aspect-square" title="Video" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" loading="lazy"></iframe></div>`);
var root_1 = $.from_html(`<video height="100%" width="100%" class="aspect-square w-full" loop="" autoplay=""><source/> Video not supported</video>`, 2);
var root_2 = $.from_html(`<div role="button" tabindex="0"><!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<button></button>`);
var root_5 = $.from_html(`<div class="mt-3 flex justify-center gap-1.5"></div>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<div class="flex-1"><!></div>`);

export default function Banner_block($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(() => $$props.block.metadata.aspectRatio?.split(':') || ['1', '1']),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		aspectWidth = $.derived(() => $.get($$array)[0]),
		aspectHeight = $.derived(() => $.get($$array)[1]);

	let mainCarouselApi = $.state(null);
	let currentIndex = $.state(0);
	const videoURLRegex = /mp4$|webm$/;
	const isVideoURL = (x) => videoURLRegex.test(x);

	onMount(() => {
		if ($$props.block.metadata.autoScroll) {
			const intervalId = setInterval(
				() => {
					$.get(mainCarouselApi)?.scrollTo(($.get(currentIndex) + 1) % $$props.block.metadata.images?.length);
				},
				$$props.block.metadata.autoScrollInterval || 2000
			);

			return () => {
				clearInterval(intervalId);
			};
		}
	});

	const flexBasis = $.derived(() => {
		const x = 1 / ($$props.block.metadata.viewCount || 1);

		return x * 100;
	});

	var div = root_7();
	var node = $.child(div);

	$.component(node, () => Carousel.Root, ($$anchor, Carousel_Root) => {
		Carousel_Root($$anchor, {
			opts: { loop: true, align: 'start' },
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
				var fragment = root_6();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Carousel.Content, ($$anchor, Carousel_Content) => {
					Carousel_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.each(node_2, 17, () => $$props.block.metadata.images || [], $.index, ($$anchor, img) => {
								const youtubeId = $.derived(() => getYoutubeId($.get(img).file));
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								{
									let $0 = $.derived(() => $.get(flexBasis));
									let $1 = $.derived(() => $$props.block.metadata.gridColumnGap ?? 8);

									$.component(node_3, () => Carousel.Item, ($$anchor, Carousel_Item) => {
										Carousel_Item($$anchor, {
											get style() {
												return `flex-basis: ${$.get($0) ?? ''}%; padding-left: ${$.get($1) ?? ''}px;`;
											},

											children: ($$anchor, $$slotProps) => {
												var div_1 = root_2();
												var node_4 = $.child(div_1);

												{
													var consequent = ($$anchor) => {
														var div_2 = root();
														var iframe = $.only_child(div_2);

														$.template_effect(() => $.set_attribute(iframe, 'src', `https://www.youtube.com/embed/${$.get(youtubeId) ?? ''}?rel=0&modestbranding=1&playsinline=1`));
														$.append($$anchor, div_2);
													};

													var consequent_1 = ($$anchor) => {
														var video = root_1();

														video.muted = true;

														var source = $.child(video);

														$.next();
														$.reset(video);
														$.template_effect(() => $.set_attribute(source, 'src', $.get(img).file));
														$.append($$anchor, video);
													};

													var d = $.derived(() => isVideoURL($.get(img).file));

													var alternate = ($$anchor) => {
														LazyImg($$anchor, {
															get src() {
																return $.get(img).file;
															},

															get aspectRatio() {
																return $$props.block.metadata.aspectRatio;
															},
															alt: 'Product Image',
															class: 'w-full rounded-radius'
														});
													};

													$.if(node_4, ($$render) => {
														if ($.get(youtubeId)) $$render(consequent); else if ($.get(d)) $$render(consequent_1, 1); else $$render(alternate, -1);
													});
												}

												$.reset(div_1);
												$.append($$anchor, div_1);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_2);
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_1, 2);

				{
					var consequent_2 = ($$anchor) => {
						var fragment_4 = root_3();
						var node_6 = $.first_child(fragment_4);

						$.component(node_6, () => Carousel.Previous, ($$anchor, Carousel_Previous) => {
							Carousel_Previous($$anchor, { class: '-left-1 md:-left-4' });
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Carousel.Next, ($$anchor, Carousel_Next) => {
							Carousel_Next($$anchor, { class: '-right-1 md:-right-4' });
						});

						$.append($$anchor, fragment_4);
					};

					$.if(node_5, ($$render) => {
						if ($$props.block.metadata.showScrollButtons) $$render(consequent_2);
					});
				}

				var node_8 = $.sibling(node_5, 2);

				{
					var consequent_3 = ($$anchor) => {
						var div_3 = root_5();

						$.each(div_3, 21, () => $$props.block.metadata.images || [], $.index, ($$anchor, _, i) => {
							var button = root_4();

							$.set_attribute(button, 'aria-label', `Go to slide ${i + 1}`);
							$.template_effect(() => $.set_class(button, 1, `h-1.5 rounded-full transition-all duration-300 ${$.get(currentIndex) === i ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`));
							$.delegated('click', button, () => $.get(mainCarouselApi)?.scrollTo(i));
							$.append($$anchor, button);
						});

						$.reset(div_3);
						$.append($$anchor, div_3);
					};

					$.if(node_8, ($$render) => {
						if ($$props.block.metadata.showCarouselIndicators) $$render(consequent_3);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);

	$.template_effect(() => $.set_style(div, `aspect-ratio: ${$.get(aspectWidth) ?? ''}/${$.get(aspectHeight) ?? ''}; ${$$props.block.metadata.maxWidth
		? `max-width: ${$$props.block.metadata.maxWidth}px;`
		: ``}`));

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);