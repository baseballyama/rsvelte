import * as $ from 'svelte/internal/server';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const countryItems = [
			{ label: "United States", value: "us" },
			{ label: "United Kingdom", value: "uk" },
			{ label: "Canada", value: "ca" }
		];

		let country = countryItems[0].value;
		const countryLabel = $.derived(() => countryItems.find((item) => item.value === country)?.label ?? "United States");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Form',
				children: ($$renderer) => {
					$$renderer.push(`<form class="w-full">`);

					if (Field.Group) {
						$$renderer.push('<!--[-->');

						Field.Group($$renderer, {
							children: ($$renderer) => {
								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										children: ($$renderer) => {
											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'form-name',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Name`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Input.Root) {
												$$renderer.push('<!--[-->');
												Input.Root($$renderer, { id: 'form-name', type: 'text', placeholder: 'John Doe' });
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

								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										children: ($$renderer) => {
											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'form-email',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Email`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Input.Root) {
												$$renderer.push('<!--[-->');

												Input.Root($$renderer, {
													id: 'form-email',
													type: 'email',
													placeholder: 'john@example.com'
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Field.Description) {
												$$renderer.push('<!--[-->');

												Field.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->We'll never share your email with anyone.`);
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

								$$renderer.push(` <div class="grid grid-cols-2 gap-4">`);

								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										children: ($$renderer) => {
											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'form-phone',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Phone`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Input.Root) {
												$$renderer.push('<!--[-->');

												Input.Root($$renderer, {
													id: 'form-phone',
													type: 'tel',
													placeholder: '+1 (555) 123-4567'
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

								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										children: ($$renderer) => {
											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'form-country',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Country`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Select.Root) {
												$$renderer.push('<!--[-->');

												Select.Root($$renderer, {
													type: 'single',
													get value() {
														return country;
													},

													set value($$value) {
														country = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'form-country',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(countryLabel())}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Select.Content) {
															$$renderer.push('<!--[-->');

															Select.Content($$renderer, {
																children: ($$renderer) => {
																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: 'us',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->United States`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: 'uk',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->United Kingdom`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Select.Item) {
																		$$renderer.push('<!--[-->');

																		Select.Item($$renderer, {
																			value: 'ca',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Canada`);
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

								$$renderer.push(`</div> `);

								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										children: ($$renderer) => {
											if (Field.Label) {
												$$renderer.push('<!--[-->');

												Field.Label($$renderer, {
													for: 'form-address',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Address`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Input.Root) {
												$$renderer.push('<!--[-->');
												Input.Root($$renderer, { id: 'form-address', type: 'text', placeholder: '123 Main St' });
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

								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (Button.Root) {
												$$renderer.push('<!--[-->');

												Button.Root($$renderer, {
													type: 'button',
													variant: 'outline',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Button.Root) {
												$$renderer.push('<!--[-->');

												Button.Root($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Submit`);
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</form>`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}