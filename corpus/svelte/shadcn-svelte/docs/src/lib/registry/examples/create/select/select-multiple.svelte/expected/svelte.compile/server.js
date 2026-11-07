import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Select_multiple($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ label: "Apple", value: "apple" },
			{ label: "Banana", value: "banana" },
			{ label: "Blueberry", value: "blueberry" },
			{ label: "Grapes", value: "grapes" },
			{ label: "Pineapple", value: "pineapple" },
			{ label: "Strawberry", value: "strawberry" },
			{ label: "Watermelon", value: "watermelon" }
		];

		let selectedValues = [];

		const selectedLabel = $.derived(() => {
			if (selectedValues.length === 0) {
				return "Select fruits";
			}

			if (selectedValues.length === 1) {
				return items.find((item) => item.value === selectedValues[0])?.label;
			}

			return `${selectedValues.length} fruits selected`;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Multiple Selection',
				children: ($$renderer) => {
					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							type: 'multiple',
							get value() {
								return selectedValues;
							},

							set value($$value) {
								selectedValues = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-72',
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