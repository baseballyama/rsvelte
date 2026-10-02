import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Toggle_group_with_input_and_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ label: "All", value: "all" },
			{ label: "Active", value: "active" },
			{ label: "Archived", value: "archived" }
		];

		let selectedValue = items[0].value;
		const selectedLabel = $.derived(() => items.find((item) => item.value === selectedValue)?.label ?? "All");
		let toggleValue = "grid";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'With Input and Select',
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-center gap-2">`);
					Input($$renderer, { type: 'search', placeholder: 'Search...', class: 'flex-1' });
					$$renderer.push(`<!----> `);

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
										class: 'w-32',
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
																	label: item.label,
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

					if (ToggleGroup.Root) {
						$$renderer.push('<!--[-->');

						ToggleGroup.Root($$renderer, {
							type: 'single',
							variant: 'outline',
							get value() {
								return toggleValue;
							},

							set value($$value) {
								toggleValue = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (ToggleGroup.Item) {
									$$renderer.push('<!--[-->');

									ToggleGroup.Item($$renderer, {
										value: 'grid',
										'aria-label': 'Grid view',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Grid`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (ToggleGroup.Item) {
									$$renderer.push('<!--[-->');

									ToggleGroup.Item($$renderer, {
										value: 'list',
										'aria-label': 'List view',
										children: ($$renderer) => {
											$$renderer.push(`<!---->List`);
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