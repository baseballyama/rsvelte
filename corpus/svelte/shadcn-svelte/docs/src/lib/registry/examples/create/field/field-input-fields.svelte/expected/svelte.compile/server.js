import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_input_fields($$renderer) {
	Example($$renderer, {
		title: 'Input Fields',
		children: ($$renderer) => {
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
											for: 'input-basic',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Basic Input`);
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
										Input.Root($$renderer, { id: 'input-basic', placeholder: 'Enter text' });
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
											for: 'input-with-desc',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Input with Description`);
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
										Input.Root($$renderer, { id: 'input-with-desc', placeholder: 'Enter your username' });
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
												$$renderer.push(`<!---->Choose a unique username for your account.`);
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

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-desc-first',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Email Address`);
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
												$$renderer.push(`<!---->We'll never share your email with anyone.`);
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
											id: 'input-desc-first',
											type: 'email',
											placeholder: 'email@example.com'
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
											for: 'input-required',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Required Field <span class="text-destructive">*</span>`);
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
											id: 'input-required',
											placeholder: 'This field is required',
											required: true
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
												$$renderer.push(`<!---->This field must be filled out.`);
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

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-disabled',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Disabled Input`);
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
											id: 'input-disabled',
											placeholder: 'Cannot edit',
											disabled: true
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
												$$renderer.push(`<!---->This field is currently disabled.`);
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

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-badge',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Input with Badge `);

												Badge($$renderer, {
													variant: 'secondary',
													class: 'ml-auto',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Recommended`);
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

									$$renderer.push(` `);

									if (Input.Root) {
										$$renderer.push('<!--[-->');
										Input.Root($$renderer, { id: 'input-badge', placeholder: 'Enter value' });
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
								'data-invalid': true,
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-invalid',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Invalid Input`);
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
											id: 'input-invalid',
											placeholder: 'This field has an error',
											'aria-invalid': true
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
												$$renderer.push(`<!---->This field contains validation errors.`);
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

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								'data-disabled': true,
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-disabled-field',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Disabled Field`);
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
											id: 'input-disabled-field',
											placeholder: 'Cannot edit',
											disabled: true
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
												$$renderer.push(`<!---->This field is currently disabled.`);
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
}