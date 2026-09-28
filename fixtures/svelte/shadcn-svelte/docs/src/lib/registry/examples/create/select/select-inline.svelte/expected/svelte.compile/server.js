import * as $ from 'svelte/internal/server';
import * as Input from "$lib/registry/ui/input/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Select_inline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ label: "All", value: "all" },
			{ label: "Active", value: "active" },
			{ label: "Inactive", value: "inactive" }
		];

		let selectedValue = undefined;
		const selectedLabel = $.derived(() => items.find((item) => item.value === selectedValue)?.label ?? "Filter");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Inline with Input & NativeSelect',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center gap-2">`);

					if (Input.Root) {
						$$renderer.push('<!--[-->');
						Input.Root($$renderer, { placeholder: 'Search...', class: 'flex-1' });
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
										class: 'w-[140px]',
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

					if (NativeSelect.Root) {
						$$renderer.push('<!--[-->');

						NativeSelect.Root($$renderer, {
							class: 'w-[140px]',
							children: ($$renderer) => {
								if (NativeSelect.Option) {
									$$renderer.push('<!--[-->');

									NativeSelect.Option($$renderer, {
										value: '',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Sort by`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (NativeSelect.Option) {
									$$renderer.push('<!--[-->');

									NativeSelect.Option($$renderer, {
										value: 'name',
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

								if (NativeSelect.Option) {
									$$renderer.push('<!--[-->');

									NativeSelect.Option($$renderer, {
										value: 'date',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Date`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (NativeSelect.Option) {
									$$renderer.push('<!--[-->');

									NativeSelect.Option($$renderer, {
										value: 'status',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Status`);
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