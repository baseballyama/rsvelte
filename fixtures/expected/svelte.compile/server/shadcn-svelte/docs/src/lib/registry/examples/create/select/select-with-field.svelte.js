import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Select_with_field($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ label: "Apple", value: "apple" },
			{ label: "Banana", value: "banana" },
			{ label: "Blueberry", value: "blueberry" },
			{ label: "Grapes", value: "grapes" },
			{ label: "Pineapple", value: "pineapple" }
		];

		let selectedValue = undefined;
		const selectedLabel = $.derived(() => items.find((item) => item.value === selectedValue)?.label ?? "Select a fruit");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'With Field',
				children: ($$renderer) => {
					if (Field.Field) {
						$$renderer.push('<!--[-->');

						Field.Field($$renderer, {
							children: ($$renderer) => {
								if (Field.Label) {
									$$renderer.push('<!--[-->');

									Field.Label($$renderer, {
										for: 'select-fruit',
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
													id: 'select-fruit',
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

								if (Field.Description) {
									$$renderer.push('<!--[-->');

									Field.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Choose your favorite fruit from the list.`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}