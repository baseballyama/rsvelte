import * as $ from 'svelte/internal/server';
import * as Modal from '$lib/components/ui/modal';
import Button from '$lib/components/button.svelte';
import { buttonVariants } from '$lib/components/ui/button';
import { Label } from '$lib/components/ui/label';
import { Input } from '$lib/components/ui/input';
import * as Field from '$lib/components/ui/field';

export default function Modal_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Modal.Root) {
			$$renderer.push('<!--[-->');

			Modal.Root($$renderer, {
				children: ($$renderer) => {
					if (Modal.Trigger) {
						$$renderer.push('<!--[-->');

						Modal.Trigger($$renderer, {
							class: buttonVariants({ variant: 'outline' }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Edit Profile`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Modal.Content) {
						$$renderer.push('<!--[-->');

						Modal.Content($$renderer, {
							children: ($$renderer) => {
								if (Modal.Header) {
									$$renderer.push('<!--[-->');

									Modal.Header($$renderer, {
										children: ($$renderer) => {
											if (Modal.Title) {
												$$renderer.push('<!--[-->');

												Modal.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Edit Profile`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Modal.Description) {
												$$renderer.push('<!--[-->');

												Modal.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Make changes to your profile here. Click save when you're done.`);
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

								if (Field.Group) {
									$$renderer.push('<!--[-->');

									Field.Group($$renderer, {
										children: ($$renderer) => {
											if (Field.Field) {
												$$renderer.push('<!--[-->');

												Field.Field($$renderer, {
													children: ($$renderer) => {
														Label($$renderer, {
															for: 'name',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Name`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);
														Input($$renderer, { id: 'name', value: 'Pedro Duarte' });
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
															for: 'username',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Username`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);
														Input($$renderer, { id: 'username', value: '@peduarte' });
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

								$$renderer.push(` `);

								if (Modal.Footer) {
									$$renderer.push('<!--[-->');

									Modal.Footer($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Save Changes`);
												},
												$$slots: { default: true }
											});
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
	});
}