import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Sheet_with_form($$renderer) {
	Example($$renderer, {
		title: 'With Form',
		children: ($$renderer) => {
			if (Sheet.Root) {
				$$renderer.push('<!--[-->');

				Sheet.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Open`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Sheet.Trigger) {
								$$renderer.push('<!--[-->');
								Sheet.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Sheet.Content) {
							$$renderer.push('<!--[-->');

							Sheet.Content($$renderer, {
								children: ($$renderer) => {
									if (Sheet.Header) {
										$$renderer.push('<!--[-->');

										Sheet.Header($$renderer, {
											children: ($$renderer) => {
												if (Sheet.Title) {
													$$renderer.push('<!--[-->');

													Sheet.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Edit profile`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Sheet.Description) {
													$$renderer.push('<!--[-->');

													Sheet.Description($$renderer, {
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

									$$renderer.push(` <div class="style-vega:px-4 style-nova:px-4 style-lyra:px-4 style-maia:px-6 style-mira:px-6 style-luma:px-6 style-rhea:px-6">`);

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
																	for: 'sheet-demo-name',
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
															Input($$renderer, { id: 'sheet-demo-name', value: 'Pedro Duarte' });
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
																	for: 'sheet-demo-username',
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
															Input($$renderer, { id: 'sheet-demo-username', value: '@peduarte' });
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

									$$renderer.push(`</div> `);

									if (Sheet.Footer) {
										$$renderer.push('<!--[-->');

										Sheet.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Save changes`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ variant: 'outline' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Close`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (Sheet.Close) {
														$$renderer.push('<!--[-->');
														Sheet.Close($$renderer, { child, $$slots: { child: true } });
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