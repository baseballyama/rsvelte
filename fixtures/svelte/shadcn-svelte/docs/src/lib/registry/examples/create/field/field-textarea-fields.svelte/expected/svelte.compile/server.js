import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Textarea from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_textarea_fields($$renderer) {
	Example($$renderer, {
		title: 'Textarea Fields',
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
											for: 'textarea-basic',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Basic Textarea`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Textarea.Root) {
										$$renderer.push('<!--[-->');
										Textarea.Root($$renderer, { id: 'textarea-basic', placeholder: 'Enter your message' });
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
											for: 'textarea-comments',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Comments`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Textarea.Root) {
										$$renderer.push('<!--[-->');

										Textarea.Root($$renderer, {
											id: 'textarea-comments',
											placeholder: 'Share your thoughts...',
											class: 'min-h-[100px]'
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
												$$renderer.push(`<!---->Maximum 500 characters allowed.`);
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
											for: 'textarea-bio',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Bio`);
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
												$$renderer.push(`<!---->Tell us about yourself in a few sentences.`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Textarea.Root) {
										$$renderer.push('<!--[-->');

										Textarea.Root($$renderer, {
											id: 'textarea-bio',
											placeholder: 'I am a...',
											class: 'min-h-[120px]'
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
											for: 'textarea-desc-after',
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

									if (Textarea.Root) {
										$$renderer.push('<!--[-->');
										Textarea.Root($$renderer, { id: 'textarea-desc-after', placeholder: 'Enter your message' });
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
												$$renderer.push(`<!---->Enter your message so it is long enough to test the layout.`);
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
								'data-invalid': true,
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'textarea-invalid',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Invalid Textarea`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Textarea.Root) {
										$$renderer.push('<!--[-->');

										Textarea.Root($$renderer, {
											id: 'textarea-invalid',
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
											for: 'textarea-disabled-field',
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

									if (Textarea.Root) {
										$$renderer.push('<!--[-->');

										Textarea.Root($$renderer, {
											id: 'textarea-disabled-field',
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