import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Field_input($$renderer) {
	$$renderer.push(`<div class="w-full max-w-md">`);

	if (Field.Set) {
		$$renderer.push('<!--[-->');

		Field.Set($$renderer, {
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
												for: 'username',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Username`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Input($$renderer, { id: 'username', type: 'text', placeholder: 'Max Leiter' });
										$$renderer.push(`<!----> `);

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
												for: 'password',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Password`);
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
													$$renderer.push(`<!---->Must be at least 8 characters long.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);
										Input($$renderer, { id: 'password', type: 'password', placeholder: '••••••••' });
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

	$$renderer.push(`</div>`);
}