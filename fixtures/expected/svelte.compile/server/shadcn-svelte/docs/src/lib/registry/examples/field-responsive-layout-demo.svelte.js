import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Field_responsive_layout_demo($$renderer) {
	$$renderer.push(`<div class="w-full max-w-4xl"><form>`);

	if (Field.Set) {
		$$renderer.push('<!--[-->');

		Field.Set($$renderer, {
			children: ($$renderer) => {
				if (Field.Legend) {
					$$renderer.push('<!--[-->');

					Field.Legend($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Profile`);
						},
						$$slots: { default: true }
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
							$$renderer.push(`<!---->Fill in your profile information.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Field.Separator) {
					$$renderer.push('<!--[-->');
					Field.Separator($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Field.Group) {
					$$renderer.push('<!--[-->');

					Field.Group($$renderer, {
						children: ($$renderer) => {
							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									orientation: 'responsive',
									children: ($$renderer) => {
										if (Field.Content) {
											$$renderer.push('<!--[-->');

											Field.Content($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'name',
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

													if (Field.Description) {
														$$renderer.push('<!--[-->');

														Field.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Provide your full name for identification`);
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
										Input($$renderer, { id: 'name', placeholder: 'Evil Rabbit', required: true });
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

							if (Field.Separator) {
								$$renderer.push('<!--[-->');
								Field.Separator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									orientation: 'responsive',
									children: ($$renderer) => {
										if (Field.Content) {
											$$renderer.push('<!--[-->');

											Field.Content($$renderer, {
												children: ($$renderer) => {
													if (Field.Label) {
														$$renderer.push('<!--[-->');

														Field.Label($$renderer, {
															for: 'message',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Message`);
															},
															$$slots: { default: true }
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
																$$renderer.push(`<!---->You can write your message here. Keep it short, preferably under 100 characters.`);
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

										Textarea($$renderer, {
											id: 'message',
											placeholder: 'Hello, world!',
											required: true,
											class: 'min-h-[100px] resize-none sm:min-w-[300px]'
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

							$$renderer.push(` `);

							if (Field.Separator) {
								$$renderer.push('<!--[-->');
								Field.Separator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									orientation: 'responsive',
									children: ($$renderer) => {
										Button($$renderer, {
											type: 'submit',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Submit`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											type: 'button',
											variant: 'outline',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cancel`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</form></div>`);
}