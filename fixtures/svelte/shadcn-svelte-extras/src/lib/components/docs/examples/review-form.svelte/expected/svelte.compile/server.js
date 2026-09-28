import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { Textarea } from '$lib/components/ui/textarea';
import { Label } from '$lib/components/ui/label';
import * as Card from '$lib/components/ui/card';
import * as StarRating from '$lib/components/ui/star-rating';
import * as Field from '$lib/components/ui/field';

export default function Review_form($$renderer) {
	let loading = false;

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Write a Review`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Tell us about your experience using acme.com`);
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

				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						class: 'flex flex-col gap-4',
						children: ($$renderer) => {
							if (Field.Group) {
								$$renderer.push('<!--[-->');

								Field.Group($$renderer, {
									children: ($$renderer) => {
										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													Label($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Comment`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);
													Textarea($$renderer, { placeholder: 'Tell us about your experience...' });
													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												children: ($$renderer) => {
													Label($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Overall Rating`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													{
														function children($$renderer, { items }) {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(items);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let item = each_array[$$index];

																if (StarRating.Star) {
																	$$renderer.push('<!--[-->');
																	StarRating.Star($$renderer, $.spread_props([item]));
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														}

														if (StarRating.Root) {
															$$renderer.push('<!--[-->');
															StarRating.Root($$renderer, { value: 1, children, $$slots: { default: true } });
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

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							Button($$renderer, {
								loading,
								class: 'w-full',
								onclick: () => {
									loading = true;

									setTimeout(
										() => {
											loading = false;
										},
										500
									);
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->Submit`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
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
}