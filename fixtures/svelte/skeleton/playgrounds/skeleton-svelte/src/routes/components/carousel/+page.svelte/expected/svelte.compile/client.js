import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Carousel } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<span>&larr;</span> <span>Back</span>`, 1);
var root_1 = $.from_html(`<span>Next</span> <span>&rarr;</span>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span>&larr;</span>`);
var root_4 = $.from_html(`<span>&rarr;</span>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<div class="relative"><!> <!></div> <!>`, 1);
var root_7 = $.from_html(`<div class="space-y-10"><header><h1 class="h1">Carousel</h1></header> <div class="space-y-4"><h2 class="h2">Default</h2> <!></div> <section class="space-y-4"><h2 class="h2">Overlap</h2> <!></section> <section class="space-y-4"><h2 class="h2">Orientation</h2> <!></section></div>`);

export default function _page($$anchor, $$props) {
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

	var div = root_7();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.sibling($.child(div_1), 2);

	Carousel(node, {
		get slideCount() {
			return slides.length;
		},
		slidesPerPage: 3,
		spacing: '16px',
		loop: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Carousel.Control, ($$anchor, Carousel_Control) => {
				Carousel_Control($$anchor, {
					class: 'flex justify-between mb-4',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_2();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Carousel.PrevTrigger, ($$anchor, Carousel_PrevTrigger) => {
							Carousel_PrevTrigger($$anchor, {
								class: 'btn preset-filled',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();

									$.next(2);
									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Carousel.AutoplayTrigger, ($$anchor, Carousel_AutoplayTrigger) => {
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

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Carousel.NextTrigger, ($$anchor, Carousel_NextTrigger) => {
							Carousel_NextTrigger($$anchor, {
								class: 'btn preset-filled',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();

									$.next(2);
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_1, 2);

			$.component(node_5, () => Carousel.ItemGroup, ($$anchor, Carousel_ItemGroup) => {
				Carousel_ItemGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = $.comment();
						var node_6 = $.first_child(fragment_4);

						$.each(node_6, 17, () => slides, $.index, ($$anchor, slide, i) => {
							var fragment_5 = $.comment();
							var node_7 = $.first_child(fragment_5);

							$.component(node_7, () => Carousel.Item, ($$anchor, Carousel_Item) => {
								Carousel_Item($$anchor, {
									index: i,
									class: 'card bg-surface-100-900 h-50 p-4 flex justify-center items-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $.get(slide).title));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_5, 2);

			$.component(node_8, () => Carousel.IndicatorGroup, ($$anchor, Carousel_IndicatorGroup) => {
				Carousel_IndicatorGroup($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = $.comment();
						var node_9 = $.first_child(fragment_7);

						{
							const children = ($$anchor, carousel = $.noop) => {
								var fragment_8 = $.comment();
								var node_10 = $.first_child(fragment_8);

								$.each(node_10, 17, () => carousel()().pageSnapPoints, $.index, ($$anchor, _, index) => {
									var fragment_9 = $.comment();
									var node_11 = $.first_child(fragment_9);

									$.component(node_11, () => Carousel.Indicator, ($$anchor, Carousel_Indicator) => {
										Carousel_Indicator($$anchor, { index });
									});

									$.append($$anchor, fragment_9);
								});

								$.append($$anchor, fragment_8);
							};

							$.component(node_9, () => Carousel.Context, ($$anchor, Carousel_Context) => {
								Carousel_Context($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var section = $.sibling(div_1, 2);
	var node_12 = $.sibling($.child(section), 2);

	Carousel(node_12, {
		get slideCount() {
			return slides.length;
		},
		slidesPerPage: 4,
		spacing: '16px',
		padding: '48px',
		autoSize: true,
		loop: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_6();
			var div_2 = $.first_child(fragment_10);
			var node_13 = $.child(div_2);

			$.component(node_13, () => Carousel.Control, ($$anchor, Carousel_Control_1) => {
				Carousel_Control_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_5();
						var node_14 = $.first_child(fragment_11);

						$.component(node_14, () => Carousel.PrevTrigger, ($$anchor, Carousel_PrevTrigger_1) => {
							Carousel_PrevTrigger_1($$anchor, {
								class: 'btn-icon preset-filled rounded-full absolute top-[50%] left-0 translate-y-[-50%]',
								children: ($$anchor, $$slotProps) => {
									var span = root_3();

									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});
						});

						var node_15 = $.sibling(node_14, 2);

						$.component(node_15, () => Carousel.NextTrigger, ($$anchor, Carousel_NextTrigger_1) => {
							Carousel_NextTrigger_1($$anchor, {
								class: 'btn-icon preset-filled rounded-full absolute top-[50%] right-0 translate-y-[-50%]',
								children: ($$anchor, $$slotProps) => {
									var span_1 = root_4();

									$.append($$anchor, span_1);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			var node_16 = $.sibling(node_13, 2);

			$.component(node_16, () => Carousel.ItemGroup, ($$anchor, Carousel_ItemGroup_1) => {
				Carousel_ItemGroup_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_12 = $.comment();
						var node_17 = $.first_child(fragment_12);

						$.each(node_17, 17, () => slides, $.index, ($$anchor, slide, i) => {
							var fragment_13 = $.comment();
							var node_18 = $.first_child(fragment_13);

							$.component(node_18, () => Carousel.Item, ($$anchor, Carousel_Item_1) => {
								Carousel_Item_1($$anchor, {
									index: i,
									class: 'card bg-surface-100-900 h-50 aspect-square p-4 flex justify-center items-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $.get(slide).title));
										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_13);
						});

						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_2);

			var node_19 = $.sibling(div_2, 2);

			$.component(node_19, () => Carousel.IndicatorGroup, ($$anchor, Carousel_IndicatorGroup_1) => {
				Carousel_IndicatorGroup_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_15 = $.comment();
						var node_20 = $.first_child(fragment_15);

						{
							const children = ($$anchor, carousel = $.noop) => {
								var fragment_16 = $.comment();
								var node_21 = $.first_child(fragment_16);

								$.each(node_21, 17, () => carousel()().pageSnapPoints, $.index, ($$anchor, _, index) => {
									var fragment_17 = $.comment();
									var node_22 = $.first_child(fragment_17);

									$.component(node_22, () => Carousel.Indicator, ($$anchor, Carousel_Indicator_1) => {
										Carousel_Indicator_1($$anchor, { index });
									});

									$.append($$anchor, fragment_17);
								});

								$.append($$anchor, fragment_16);
							};

							$.component(node_20, () => Carousel.Context, ($$anchor, Carousel_Context_1) => {
								Carousel_Context_1($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_15);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var node_23 = $.sibling($.child(section_1), 2);

	Carousel(node_23, {
		get slideCount() {
			return slides.length;
		},
		slidesPerPage: 3,
		spacing: '16px',
		loop: true,
		orientation: 'vertical',
		autoSize: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_18 = root_2();
			var node_24 = $.first_child(fragment_18);

			$.component(node_24, () => Carousel.Control, ($$anchor, Carousel_Control_2) => {
				Carousel_Control_2($$anchor, {
					class: 'flex justify-between mb-4',
					children: ($$anchor, $$slotProps) => {
						var fragment_19 = root_2();
						var node_25 = $.first_child(fragment_19);

						$.component(node_25, () => Carousel.PrevTrigger, ($$anchor, Carousel_PrevTrigger_2) => {
							Carousel_PrevTrigger_2($$anchor, {
								class: 'btn preset-filled',
								children: ($$anchor, $$slotProps) => {
									var fragment_20 = root();

									$.next(2);
									$.append($$anchor, fragment_20);
								},
								$$slots: { default: true }
							});
						});

						var node_26 = $.sibling(node_25, 2);

						$.component(node_26, () => Carousel.AutoplayTrigger, ($$anchor, Carousel_AutoplayTrigger_1) => {
							Carousel_AutoplayTrigger_1($$anchor, {
								class: 'btn preset-tonal',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Toggle Autoplay');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_27 = $.sibling(node_26, 2);

						$.component(node_27, () => Carousel.NextTrigger, ($$anchor, Carousel_NextTrigger_2) => {
							Carousel_NextTrigger_2($$anchor, {
								class: 'btn preset-filled',
								children: ($$anchor, $$slotProps) => {
									var fragment_21 = root_1();

									$.next(2);
									$.append($$anchor, fragment_21);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_19);
					},
					$$slots: { default: true }
				});
			});

			var node_28 = $.sibling(node_24, 2);

			$.component(node_28, () => Carousel.ItemGroup, ($$anchor, Carousel_ItemGroup_2) => {
				Carousel_ItemGroup_2($$anchor, {
					class: 'h-80',
					children: ($$anchor, $$slotProps) => {
						var fragment_22 = $.comment();
						var node_29 = $.first_child(fragment_22);

						$.each(node_29, 17, () => slides, $.index, ($$anchor, slide, i) => {
							var fragment_23 = $.comment();
							var node_30 = $.first_child(fragment_23);

							$.component(node_30, () => Carousel.Item, ($$anchor, Carousel_Item_2) => {
								Carousel_Item_2($$anchor, {
									index: i,
									class: 'card bg-surface-100-900/90 h-32 p-4 flex justify-center items-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text();

										$.template_effect(() => $.set_text(text_4, $.get(slide).title));
										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_23);
						});

						$.append($$anchor, fragment_22);
					},
					$$slots: { default: true }
				});
			});

			var node_31 = $.sibling(node_28, 2);

			$.component(node_31, () => Carousel.IndicatorGroup, ($$anchor, Carousel_IndicatorGroup_2) => {
				Carousel_IndicatorGroup_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_25 = $.comment();
						var node_32 = $.first_child(fragment_25);

						{
							const children = ($$anchor, carousel = $.noop) => {
								var fragment_26 = $.comment();
								var node_33 = $.first_child(fragment_26);

								$.each(node_33, 17, () => carousel()().pageSnapPoints, $.index, ($$anchor, _, index) => {
									var fragment_27 = $.comment();
									var node_34 = $.first_child(fragment_27);

									$.component(node_34, () => Carousel.Indicator, ($$anchor, Carousel_Indicator_2) => {
										Carousel_Indicator_2($$anchor, { index });
									});

									$.append($$anchor, fragment_27);
								});

								$.append($$anchor, fragment_26);
							};

							$.component(node_32, () => Carousel.Context, ($$anchor, Carousel_Context_2) => {
								Carousel_Context_2($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_25);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_18);
		},
		$$slots: { default: true }
	});

	$.reset(section_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}