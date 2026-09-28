import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Field_field_set_demo($$renderer) {
	$$renderer.push(`<div class="w-full max-w-md space-y-6">`);

	if (Field.Set) {
		$$renderer.push('<!--[-->');

		Field.Set($$renderer, {
			children: ($$renderer) => {
				if (Field.Legend) {
					$$renderer.push('<!--[-->');

					Field.Legend($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Address Information`);
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
							$$renderer.push(`<!---->We need your address to deliver your order.`);
						},
						$$slots: { default: true }
					});

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
									children: ($$renderer) => {
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'street',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Street Address`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Input($$renderer, { id: 'street', type: 'text', placeholder: '123 Main St' });
										$$renderer.push(`<!---->`);
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
												for: 'city',
												children: ($$renderer) => {
													$$renderer.push(`<!---->City`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Input($$renderer, { id: 'city', type: 'text', placeholder: 'New York' });
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
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'zip',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Postal Code`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Input($$renderer, { id: 'zip', type: 'text', placeholder: '90502' });
										$$renderer.push(`<!---->`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}