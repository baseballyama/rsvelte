import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<span>&larr;</span> <span>Back</span>`, 1);
var root_1 = $.from_html(`<span>Next</span> <span>&rarr;</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Orientation($$anchor, $$props) {
	$.push($$props, true);

	const slides = [
		{ title: 'Slide 1' },
		{ title: 'Slide 2' },
		{ title: 'Slide 3' },
		{ title: 'Slide 4' },
		{ title: 'Slide 5' },
		{ title: 'Slide 6' },
		{ title: 'Slide 7' },
		{ title: 'Slide 8' },
		{ title: 'Slide 9' },
		{ title: 'Slide 10' }
	];

	Carousel($$anchor, {
		get slideCount() {
			return slides.length;
		},
		slidesPerPage: 3,
		spacing: '16px',
		loop: true,
		orientation: 'vertical',
		autoSize: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => Carousel.Control, ($$anchor, Carousel_Control) => {
				Carousel_Control($$anchor, {
					class: 'flex justify-between mb-4',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Carousel.PrevTrigger, ($$anchor, Carousel_PrevTrigger) => {
							Carousel_PrevTrigger($$anchor, {
								class: 'btn preset-filled',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();

									$.next(2);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Carousel.AutoplayTrigger, ($$anchor, Carousel_AutoplayTrigger) => {
							Carousel_AutoplayTrigger($$anchor, {
								class: 'btn preset-tonal',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Toggle Autoplay');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Carousel.NextTrigger, ($$anchor, Carousel_NextTrigger) => {
							Carousel_NextTrigger($$anchor, {
								class: 'btn preset-filled',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();

									$.next(2);
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

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => Carousel.ItemGroup, ($$anchor, Carousel_ItemGroup) => {
				Carousel_ItemGroup($$anchor, {
					class: 'h-80',
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = $.comment();
						var node_5 = $.first_child(fragment_5);

						$.each(node_5, 17, () => slides, $.index, ($$anchor, slide, i) => {
							var fragment_6 = $.comment();
							var node_6 = $.first_child(fragment_6);

							$.component(node_6, () => Carousel.Item, ($$anchor, Carousel_Item) => {
								Carousel_Item($$anchor, {
									index: i,
									class: 'card bg-surface-100-900/90 h-32 p-4 flex justify-center items-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(slide).title));
										$.append($$anchor, text_1);
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

			var node_7 = $.sibling(node_4, 2);

			$.component(node_7, () => Carousel.IndicatorGroup, ($$anchor, Carousel_IndicatorGroup) => {
				Carousel_IndicatorGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = $.comment();
						var node_8 = $.first_child(fragment_8);

						{
							const children = ($$anchor, carousel = $.noop) => {
								var fragment_9 = $.comment();
								var node_9 = $.first_child(fragment_9);

								$.each(node_9, 17, () => carousel()().pageSnapPoints, $.index, ($$anchor, _, index) => {
									var fragment_10 = $.comment();
									var node_10 = $.first_child(fragment_10);

									$.component(node_10, () => Carousel.Indicator, ($$anchor, Carousel_Indicator) => {
										Carousel_Indicator($$anchor, { index });
									});

									$.append($$anchor, fragment_10);
								});

								$.append($$anchor, fragment_9);
							};

							$.component(node_8, () => Carousel.Context, ($$anchor, Carousel_Context) => {
								Carousel_Context($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}