import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Select_invalid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ label: "Apple", value: "apple" },
			{ label: "Banana", value: "banana" },
			{ label: "Blueberry", value: "blueberry" },
			{ label: "Grapes", value: "grapes" },
			{ label: "Pineapple", value: "pineapple" }
		];

		let selectedValue = undefined;
		let selectedValueInvalid = undefined;
		const selectedLabel = $.derived(() => items.find((item) => item.value === selectedValue)?.label ?? "Select a fruit");
		const selectedLabelInvalid = $.derived(() => items.find((item) => item.value === selectedValueInvalid)?.label ?? "Select a fruit");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Invalid',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-4">`);

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							type: 'single',
							get value() {
								return selectedValue;
							},

							set value($$value) {
								selectedValue = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										'aria-invalid': 'true',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(selectedLabel())}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Group) {
												$$renderer.push('<!--[-->');

												Select.Group($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(items);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let item = each_array[$$index];

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: item.value,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(item.label)}`);
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

					$$renderer.push(` `);

					if (Field.Field) {
						$$renderer.push('<!--[-->');

						Field.Field($$renderer, {
							'data-invalid': true,
							children: ($$renderer) => {
								if (Field.Label) {
									$$renderer.push('<!--[-->');

									Field.Label($$renderer, {
										for: 'select-fruit-invalid',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Favorite Fruit`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Select.Root) {
									$$renderer.push('<!--[-->');

									Select.Root($$renderer, {
										type: 'single',
										get value() {
											return selectedValueInvalid;
										},

										set value($$value) {
											selectedValueInvalid = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (Select.Trigger) {
												$$renderer.push('<!--[-->');

												Select.Trigger($$renderer, {
													id: 'select-fruit-invalid',
													'aria-invalid': true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(selectedLabelInvalid())}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Select.Content) {
												$$renderer.push('<!--[-->');

												Select.Content($$renderer, {
													children: ($$renderer) => {
														if (Select.Group) {
															$$renderer.push('<!--[-->');

															Select.Group($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array_1 = $.ensure_array_like(items);

																	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																		let item = each_array_1[$$index_1];

																		if (Select.Item) {
																			$$renderer.push('<!--[-->');

																			Select.Item($$renderer, {
																				value: item.value,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(item.label)}`);
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

								$$renderer.push(` `);

								if (Field.Error) {
									$$renderer.push('<!--[-->');
									Field.Error($$renderer, { errors: [{ message: "Please select a valid fruit." }] });
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
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}