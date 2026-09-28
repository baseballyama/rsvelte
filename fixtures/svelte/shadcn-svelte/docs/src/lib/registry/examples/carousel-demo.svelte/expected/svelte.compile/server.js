import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Carousel from "$lib/registry/ui/carousel/index.js";

export default function Carousel_demo($$renderer) {
	if (Carousel.Root) {
		$$renderer.push('<!--[-->');

		Carousel.Root($$renderer, {
			class: 'w-full max-w-xs',
			children: ($$renderer) => {
				if (Carousel.Content) {
					$$renderer.push('<!--[-->');

					Carousel.Content($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(Array(5));

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								if (Carousel.Item) {
									$$renderer.push('<!--[-->');

									Carousel.Item($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<div class="p-1">`);

											if (Card.Root) {
												$$renderer.push('<!--[-->');

												Card.Root($$renderer, {
													children: ($$renderer) => {
														if (Card.Content) {
															$$renderer.push('<!--[-->');

															Card.Content($$renderer, {
																class: 'flex aspect-square items-center justify-center p-6',
																children: ($$renderer) => {
																	$$renderer.push(`<span class="text-4xl font-semibold">${$.escape(i + 1)}</span>`);
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

				if (Carousel.Previous) {
					$$renderer.push('<!--[-->');
					Carousel.Previous($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Carousel.Next) {
					$$renderer.push('<!--[-->');
					Carousel.Next($$renderer, {});
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
}