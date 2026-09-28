import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_with_select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const currencyItems = [
			{ label: "$", value: "$" },
			{ label: "€", value: "€" },
			{ label: "£", value: "£" }
		];

		let currency = currencyItems[0].value;
		const currencyLabel = $.derived(() => currencyItems.find((item) => item.value === currency)?.label ?? "$");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'With Select',
				children: ($$renderer) => {
					if (Field.Field) {
						$$renderer.push('<!--[-->');

						Field.Field($$renderer, {
							children: ($$renderer) => {
								Label($$renderer, {
									for: 'amount',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Amount`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								ButtonGroup($$renderer, {
									children: ($$renderer) => {
										if (Select.Root) {
											$$renderer.push('<!--[-->');

											Select.Root($$renderer, {
												type: 'single',
												get value() {
													return currency;
												},

												set value($$value) {
													currency = $$value;
													$$settled = false;
												},

												children: ($$renderer) => {
													if (Select.Trigger) {
														$$renderer.push('<!--[-->');

														Select.Trigger($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(currencyLabel())}`);
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

																			const each_array = $.ensure_array_like(currencyItems);

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
										Input($$renderer, { placeholder: 'Enter amount to send' });
										$$renderer.push(`<!----> `);

										Button($$renderer, {
											variant: 'outline',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'ArrowRightIcon',
													tabler: 'IconArrowRight',
													hugeicons: 'ArrowRight01Icon',
													phosphor: 'ArrowRightIcon',
													remixicon: 'RiArrowRightLine'
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
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