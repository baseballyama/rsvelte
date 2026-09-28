import * as $ from 'svelte/internal/server';
import { Carousel } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<div class="space-y-10"><header><h1 class="h1">Carousel</h1></header> <div class="space-y-4"><h2 class="h2">Default</h2> `);

		Carousel($$renderer, {
			slideCount: slides.length,
			slidesPerPage: 3,
			spacing: '16px',
			loop: true,
			children: ($$renderer) => {
				if (Carousel.Control) {
					$$renderer.push('<!--[-->');

					Carousel.Control($$renderer, {
						class: 'flex justify-between mb-4',
						children: ($$renderer) => {
							if (Carousel.PrevTrigger) {
								$$renderer.push('<!--[-->');

								Carousel.PrevTrigger($$renderer, {
									class: 'btn preset-filled',
									children: ($$renderer) => {
										$$renderer.push(`<span>←</span> <span>Back</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Carousel.AutoplayTrigger) {
								$$renderer.push('<!--[-->');

								Carousel.AutoplayTrigger($$renderer, {
									class: 'btn preset-tonal',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Toggle Autoplay`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Carousel.NextTrigger) {
								$$renderer.push('<!--[-->');

								Carousel.NextTrigger($$renderer, {
									class: 'btn preset-filled',
									children: ($$renderer) => {
										$$renderer.push(`<span>Next</span> <span>→</span>`);
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

				if (Carousel.ItemGroup) {
					$$renderer.push('<!--[-->');

					Carousel.ItemGroup($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(slides);

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let slide = each_array[i];

								if (Carousel.Item) {
									$$renderer.push('<!--[-->');

									Carousel.Item($$renderer, {
										index: i,
										class: 'card bg-surface-100-900 h-50 p-4 flex justify-center items-center',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(slide.title)}`);
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

				if (Carousel.IndicatorGroup) {
					$$renderer.push('<!--[-->');

					Carousel.IndicatorGroup($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, carousel) {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(carousel().pageSnapPoints);

									for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
										let _ = each_array_1[index];

										if (Carousel.Indicator) {
											$$renderer.push('<!--[-->');
											Carousel.Indicator($$renderer, { index });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Carousel.Context) {
									$$renderer.push('<!--[-->');
									Carousel.Context($$renderer, { children, $$slots: { default: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}
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

		$$renderer.push(`<!----></div> <section class="space-y-4"><h2 class="h2">Overlap</h2> `);

		Carousel($$renderer, {
			slideCount: slides.length,
			slidesPerPage: 4,
			spacing: '16px',
			padding: '48px',
			autoSize: true,
			loop: true,
			children: ($$renderer) => {
				$$renderer.push(`<div class="relative">`);

				if (Carousel.Control) {
					$$renderer.push('<!--[-->');

					Carousel.Control($$renderer, {
						children: ($$renderer) => {
							if (Carousel.PrevTrigger) {
								$$renderer.push('<!--[-->');

								Carousel.PrevTrigger($$renderer, {
									class: 'btn-icon preset-filled rounded-full absolute top-[50%] left-0 translate-y-[-50%]',
									children: ($$renderer) => {
										$$renderer.push(`<span>←</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Carousel.NextTrigger) {
								$$renderer.push('<!--[-->');

								Carousel.NextTrigger($$renderer, {
									class: 'btn-icon preset-filled rounded-full absolute top-[50%] right-0 translate-y-[-50%]',
									children: ($$renderer) => {
										$$renderer.push(`<span>→</span>`);
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

				if (Carousel.ItemGroup) {
					$$renderer.push('<!--[-->');

					Carousel.ItemGroup($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_2 = $.ensure_array_like(slides);

							for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
								let slide = each_array_2[i];

								if (Carousel.Item) {
									$$renderer.push('<!--[-->');

									Carousel.Item($$renderer, {
										index: i,
										class: 'card bg-surface-100-900 h-50 aspect-square p-4 flex justify-center items-center',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(slide.title)}`);
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

				$$renderer.push(`</div> `);

				if (Carousel.IndicatorGroup) {
					$$renderer.push('<!--[-->');

					Carousel.IndicatorGroup($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, carousel) {
									$$renderer.push(`<!--[-->`);

									const each_array_3 = $.ensure_array_like(carousel().pageSnapPoints);

									for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
										let _ = each_array_3[index];

										if (Carousel.Indicator) {
											$$renderer.push('<!--[-->');
											Carousel.Indicator($$renderer, { index });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Carousel.Context) {
									$$renderer.push('<!--[-->');
									Carousel.Context($$renderer, { children, $$slots: { default: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}
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

		$$renderer.push(`<!----></section> <section class="space-y-4"><h2 class="h2">Orientation</h2> `);

		Carousel($$renderer, {
			slideCount: slides.length,
			slidesPerPage: 3,
			spacing: '16px',
			loop: true,
			orientation: 'vertical',
			autoSize: true,
			children: ($$renderer) => {
				if (Carousel.Control) {
					$$renderer.push('<!--[-->');

					Carousel.Control($$renderer, {
						class: 'flex justify-between mb-4',
						children: ($$renderer) => {
							if (Carousel.PrevTrigger) {
								$$renderer.push('<!--[-->');

								Carousel.PrevTrigger($$renderer, {
									class: 'btn preset-filled',
									children: ($$renderer) => {
										$$renderer.push(`<span>←</span> <span>Back</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Carousel.AutoplayTrigger) {
								$$renderer.push('<!--[-->');

								Carousel.AutoplayTrigger($$renderer, {
									class: 'btn preset-tonal',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Toggle Autoplay`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Carousel.NextTrigger) {
								$$renderer.push('<!--[-->');

								Carousel.NextTrigger($$renderer, {
									class: 'btn preset-filled',
									children: ($$renderer) => {
										$$renderer.push(`<span>Next</span> <span>→</span>`);
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

				if (Carousel.ItemGroup) {
					$$renderer.push('<!--[-->');

					Carousel.ItemGroup($$renderer, {
						class: 'h-80',
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_4 = $.ensure_array_like(slides);

							for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
								let slide = each_array_4[i];

								if (Carousel.Item) {
									$$renderer.push('<!--[-->');

									Carousel.Item($$renderer, {
										index: i,
										class: 'card bg-surface-100-900/90 h-32 p-4 flex justify-center items-center',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(slide.title)}`);
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

				if (Carousel.IndicatorGroup) {
					$$renderer.push('<!--[-->');

					Carousel.IndicatorGroup($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, carousel) {
									$$renderer.push(`<!--[-->`);

									const each_array_5 = $.ensure_array_like(carousel().pageSnapPoints);

									for (let index = 0, $$length = each_array_5.length; index < $$length; index++) {
										let _ = each_array_5[index];

										if (Carousel.Indicator) {
											$$renderer.push('<!--[-->');
											Carousel.Indicator($$renderer, { index });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Carousel.Context) {
									$$renderer.push('<!--[-->');
									Carousel.Context($$renderer, { children, $$slots: { default: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}
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

		$$renderer.push(`<!----></section></div>`);
	});
}