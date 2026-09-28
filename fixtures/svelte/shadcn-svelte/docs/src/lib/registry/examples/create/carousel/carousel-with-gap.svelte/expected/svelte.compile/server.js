import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Carousel from "$lib/registry/ui/carousel/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Carousel_with_gap($$renderer) {
	Example($$renderer, {
		title: 'With Gap',
		children: ($$renderer) => {
			if (Carousel.Root) {
				$$renderer.push('<!--[-->');

				Carousel.Root($$renderer, {
					class: 'mx-auto max-w-xs sm:max-w-sm',
					children: ($$renderer) => {
						if (Carousel.Content) {
							$$renderer.push('<!--[-->');

							Carousel.Content($$renderer, {
								class: '-ml-1',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(Array(5));

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let _ = each_array[index];

										if (Carousel.Item) {
											$$renderer.push('<!--[-->');

											Carousel.Item($$renderer, {
												class: 'pl-1 md:basis-1/2',
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
																			$$renderer.push(`<span class="text-2xl font-semibold">${$.escape(index + 1)}</span>`);
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
							Carousel.Previous($$renderer, { class: 'hidden sm:inline-flex' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Carousel.Next) {
							$$renderer.push('<!--[-->');
							Carousel.Next($$renderer, { class: 'hidden sm:inline-flex' });
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
		},
		$$slots: { default: true }
	});
}