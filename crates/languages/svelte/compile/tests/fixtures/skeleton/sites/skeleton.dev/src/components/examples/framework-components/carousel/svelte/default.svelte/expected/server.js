import * as $ from 'svelte/internal/server';
import { Carousel } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer, $$props) {
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
	});
}