import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Card, CardContent } from "$lib/registry/ui/card/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";

export default function Field_hear($$renderer) {
	const options = [
		{ label: "Social Media", value: "social-media" },
		{ label: "Search Engine", value: "search-engine" },
		{ label: "Referral", value: "referral" },
		{ label: "Other", value: "other" }
	];

	Card($$renderer, {
		class: 'py-4 shadow-none',
		children: ($$renderer) => {
			CardContent($$renderer, {
				class: 'px-4',
				children: ($$renderer) => {
					$$renderer.push(`<form>`);

					if (Field.Group) {
						$$renderer.push('<!--[-->');

						Field.Group($$renderer, {
							children: ($$renderer) => {
								if (Field.Set) {
									$$renderer.push('<!--[-->');

									Field.Set($$renderer, {
										class: 'gap-4',
										children: ($$renderer) => {
											if (Field.Legend) {
												$$renderer.push('<!--[-->');

												Field.Legend($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->How did you hear about us?`);
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
													class: 'line-clamp-1',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Select the option that best describes how you heard about us.`);
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
													class: 'flex flex-row flex-wrap gap-2 [--radius:9999rem]',
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(options);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let option = each_array[$$index];

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: option.value,
																	class: '!w-fit',
																	children: ($$renderer) => {
																		if (Field.Field) {
																			$$renderer.push('<!--[-->');

																			Field.Field($$renderer, {
																				orientation: 'horizontal',
																				class: 'gap-1.5 overflow-hidden !px-3 !py-1.5 transition-all duration-100 ease-linear group-has-data-[state=checked]/field-label:!px-2',
																				children: ($$renderer) => {
																					Checkbox($$renderer, {
																						value: option.value,
																						id: option.value,
																						checked: option.value === "social-media",
																						class: '-ms-6 -translate-x-1 rounded-full transition-all duration-100 ease-linear data-[state=checked]:ms-0 data-[state=checked]:translate-x-0'
																					});

																					$$renderer.push(`<!----> `);

																					if (Field.Title) {
																						$$renderer.push('<!--[-->');

																						Field.Title($$renderer, {
																							class: 'text-nowrap',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(option.label)}`);
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
														}

														$$renderer.push(`<!--]-->`);
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

					$$renderer.push(`</form>`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}