import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Radio_group_with_descriptions($$renderer) {
	Example($$renderer, {
		title: 'With Descriptions',
		children: ($$renderer) => {
			if (RadioGroup.Root) {
				$$renderer.push('<!--[-->');

				RadioGroup.Root($$renderer, {
					value: 'plus',
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'plus-plan',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											orientation: 'horizontal',
											children: ($$renderer) => {
												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<div class="font-medium">Plus</div> `);

															if (Field.Description) {
																$$renderer.push('<!--[-->');

																Field.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->For individuals and small teams`);
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

												if (RadioGroup.Item) {
													$$renderer.push('<!--[-->');
													RadioGroup.Item($$renderer, { value: 'plus', id: 'plus-plan' });
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

						$$renderer.push(` `);

						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'pro-plan',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											orientation: 'horizontal',
											children: ($$renderer) => {
												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<div class="font-medium">Pro</div> `);

															if (Field.Description) {
																$$renderer.push('<!--[-->');

																Field.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->For growing businesses`);
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

												if (RadioGroup.Item) {
													$$renderer.push('<!--[-->');
													RadioGroup.Item($$renderer, { value: 'pro', id: 'pro-plan' });
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

						$$renderer.push(` `);

						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'enterprise-plan',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											orientation: 'horizontal',
											children: ($$renderer) => {
												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<div class="font-medium">Enterprise</div> `);

															if (Field.Description) {
																$$renderer.push('<!--[-->');

																Field.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->For large teams and enterprises`);
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

												if (RadioGroup.Item) {
													$$renderer.push('<!--[-->');
													RadioGroup.Item($$renderer, { value: 'enterprise', id: 'enterprise-plan' });
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
		},
		$$slots: { default: true }
	});
}