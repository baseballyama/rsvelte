import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Select_sizes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ label: "Apple", value: "apple" },
			{ label: "Banana", value: "banana" },
			{ label: "Blueberry", value: "blueberry" }
		];

		let selectedValueSm = undefined;
		let selectedValueDefault = undefined;
		const selectedLabelSm = $.derived(() => items.find((item) => item.value === selectedValueSm)?.label ?? "Small size");
		const selectedLabelDefault = $.derived(() => items.find((item) => item.value === selectedValueDefault)?.label ?? "Default size");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Sizes',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col gap-4">`);

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							type: 'single',
							get value() {
								return selectedValueSm;
							},

							set value($$value) {
								selectedValueSm = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										size: 'sm',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(selectedLabelSm())}`);
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

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							type: 'single',
							get value() {
								return selectedValueDefault;
							},

							set value($$value) {
								selectedValueDefault = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										size: 'default',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(selectedLabelDefault())}`);
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