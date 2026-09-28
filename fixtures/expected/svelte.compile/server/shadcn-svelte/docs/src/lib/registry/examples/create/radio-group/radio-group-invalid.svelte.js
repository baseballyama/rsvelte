import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Radio_group_invalid($$renderer) {
	Example($$renderer, {
		title: 'Invalid',
		children: ($$renderer) => {
			if (Field.Set) {
				$$renderer.push('<!--[-->');

				Field.Set($$renderer, {
					children: ($$renderer) => {
						if (Field.Legend) {
							$$renderer.push('<!--[-->');

							Field.Legend($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Notification Preferences`);
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
									$$renderer.push(`<!---->Choose how you want to receive notifications.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (RadioGroup.Root) {
							$$renderer.push('<!--[-->');

							RadioGroup.Root($$renderer, {
								value: 'email',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											orientation: 'horizontal',
											'data-invalid': true,
											children: ($$renderer) => {
												if (RadioGroup.Item) {
													$$renderer.push('<!--[-->');
													RadioGroup.Item($$renderer, { value: 'email', id: 'invalid-email', 'aria-invalid': true });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'invalid-email',
														class: 'font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Email only`);
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
											orientation: 'horizontal',
											'data-invalid': true,
											children: ($$renderer) => {
												if (RadioGroup.Item) {
													$$renderer.push('<!--[-->');
													RadioGroup.Item($$renderer, { value: 'sms', id: 'invalid-sms', 'aria-invalid': true });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'invalid-sms',
														class: 'font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->SMS only`);
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
											orientation: 'horizontal',
											'data-invalid': true,
											children: ($$renderer) => {
												if (RadioGroup.Item) {
													$$renderer.push('<!--[-->');
													RadioGroup.Item($$renderer, { value: 'both', id: 'invalid-both', 'aria-invalid': true });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'invalid-both',
														class: 'font-normal',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Both Email &amp; SMS`);
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