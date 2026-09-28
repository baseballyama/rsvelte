import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<span>&larr;</span>`);
var root_1 = $.from_html(`<span>&rarr;</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="relative"><!> <!></div> <!>`, 1);

export default function Overlap($$anchor, $$props) {
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
		slidesPerPage: 4,
		spacing: '16px',
		padding: '48px',
		autoSize: true,
		loop: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			$.component(node, () => Carousel.Control, ($$anchor, Carousel_Control) => {
				Carousel_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Carousel.PrevTrigger, ($$anchor, Carousel_PrevTrigger) => {
							Carousel_PrevTrigger($$anchor, {
								class: 'btn-icon preset-filled rounded-full absolute top-[50%] left-0 translate-y-[-50%]',
								children: ($$anchor, $$slotProps) => {
									var span = root();

									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Carousel.NextTrigger, ($$anchor, Carousel_NextTrigger) => {
							Carousel_NextTrigger($$anchor, {
								class: 'btn-icon preset-filled rounded-full absolute top-[50%] right-0 translate-y-[-50%]',
								children: ($$anchor, $$slotProps) => {
									var span_1 = root_1();

									$.append($$anchor, span_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			$.component(node_3, () => Carousel.ItemGroup, ($$anchor, Carousel_ItemGroup) => {
				Carousel_ItemGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						$.each(node_4, 17, () => slides, $.index, ($$anchor, slide, i) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							$.component(node_5, () => Carousel.Item, ($$anchor, Carousel_Item) => {
								Carousel_Item($$anchor, {
									index: i,
									class: 'card bg-surface-100-900 h-50 aspect-square p-4 flex justify-center items-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(slide).title));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);

			var node_6 = $.sibling(div, 2);

			$.component(node_6, () => Carousel.IndicatorGroup, ($$anchor, Carousel_IndicatorGroup) => {
				Carousel_IndicatorGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = $.comment();
						var node_7 = $.first_child(fragment_6);

						{
							const children = ($$anchor, carousel = $.noop) => {
								var fragment_7 = $.comment();
								var node_8 = $.first_child(fragment_7);

								$.each(node_8, 17, () => carousel()().pageSnapPoints, $.index, ($$anchor, _, index) => {
									var fragment_8 = $.comment();
									var node_9 = $.first_child(fragment_8);

									$.component(node_9, () => Carousel.Indicator, ($$anchor, Carousel_Indicator) => {
										Carousel_Indicator($$anchor, { index });
									});

									$.append($$anchor, fragment_8);
								});

								$.append($$anchor, fragment_7);
							};

							$.component(node_7, () => Carousel.Context, ($$anchor, Carousel_Context) => {
								Carousel_Context($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_6);
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