import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Select_disabled($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ label: "Apple", value: "apple" },
			{ label: "Banana", value: "banana" },
			{ label: "Blueberry", value: "blueberry" },
			{ label: "Grapes", value: "grapes", disabled: true },
			{ label: "Pineapple", value: "pineapple" }
		];

		let selectedValue = undefined;
		const selectedLabel = $.derived(() => items.find((item) => item.value === selectedValue)?.label ?? "Select a fruit");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Disabled',
				children: ($$renderer) => {
					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							type: 'single',
							disabled: true,
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
																	disabled: item.disabled,
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