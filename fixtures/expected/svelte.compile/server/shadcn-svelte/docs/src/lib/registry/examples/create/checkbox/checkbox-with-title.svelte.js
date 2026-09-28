import * as $ from 'svelte/internal/server';
import * as Checkbox from "$lib/registry/ui/checkbox/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Checkbox_with_title($$renderer) {
	Example($$renderer, {
		title: 'With Title',
		children: ($$renderer) => {
			if (Field.Group) {
				$$renderer.push('<!--[-->');

				Field.Group($$renderer, {
					children: ($$renderer) => {
						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'toggle-2',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											orientation: 'horizontal',
											children: ($$renderer) => {
												if (Checkbox.Root) {
													$$renderer.push('<!--[-->');
													Checkbox.Root($$renderer, { id: 'toggle-2', checked: true });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															if (Field.Title) {
																$$renderer.push('<!--[-->');

																Field.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Enable notifications`);
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
																		$$renderer.push(`<!---->You can enable or disable notifications at any time.`);
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

						$$renderer.push(` `);

						if (Field.Label) {
							$$renderer.push('<!--[-->');

							Field.Label($$renderer, {
								for: 'toggle-4',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											orientation: 'horizontal',
											'data-disabled': true,
											children: ($$renderer) => {
												if (Checkbox.Root) {
													$$renderer.push('<!--[-->');
													Checkbox.Root($$renderer, { id: 'toggle-4', disabled: true });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															if (Field.Title) {
																$$renderer.push('<!--[-->');

																Field.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Enable notifications`);
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
																		$$renderer.push(`<!---->You can enable or disable notifications at any time.`);
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