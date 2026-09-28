import * as $ from 'svelte/internal/server';
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Button_group_select_demo($$renderer) {
	const CURRENCIES = [
		{ value: "$", label: "US Dollar" },
		{ value: "€", label: "Euro" },
		{ value: "£", label: "British Pound" }
	];

	let currency = "$";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (ButtonGroup.Root) {
			$$renderer.push('<!--[-->');

			ButtonGroup.Root($$renderer, {
				children: ($$renderer) => {
					if (ButtonGroup.Root) {
						$$renderer.push('<!--[-->');

						ButtonGroup.Root($$renderer, {
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
													class: 'font-mono',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(currency)}`);
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
													class: 'min-w-24',
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(CURRENCIES);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let currencyOption = each_array[$$index];

															if (Select.Item) {
																$$renderer.push('<!--[-->');

																Select.Item($$renderer, {
																	value: currencyOption.value,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(currencyOption.value)} <span class="text-muted-foreground">${$.escape(currencyOption.label)}</span>`);
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

								$$renderer.push(` `);
								Input($$renderer, { placeholder: '10.00', pattern: '[0-9]*' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (ButtonGroup.Root) {
						$$renderer.push('<!--[-->');

						ButtonGroup.Root($$renderer, {
							children: ($$renderer) => {
								Button($$renderer, {
									'aria-label': 'Send',
									size: 'icon',
									variant: 'outline',
									children: ($$renderer) => {
										ArrowRight($$renderer, {});
									},
									$$slots: { default: true }
								});
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}