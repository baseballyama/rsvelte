import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Field, FieldDescription, FieldGroup, FieldLabel } from "$lib/registry/ui/field/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger
} from "$lib/registry/ui/select/index.js";

import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Payout_threshold($$renderer) {
	const CURRENCIES = [
		{ label: "USD — United States Dollar", value: "usd" },
		{ label: "EUR — Euro", value: "eur" },
		{ label: "GBP — British Pound", value: "gbp" },
		{ label: "JPY — Japanese Yen", value: "jpy" }
	];

	Card($$renderer, {
		children: ($$renderer) => {
			CardHeader($$renderer, {
				children: ($$renderer) => {
					CardTitle($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Payout Threshold`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardDescription($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Set the minimum balance required before a payout is triggered.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardAction($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'ghost',
								size: 'icon-sm',
								class: 'bg-muted',
								'aria-label': 'Dismiss payout threshold',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'XIcon',
										tabler: 'IconX',
										hugeicons: 'Cancel01Icon',
										phosphor: 'XIcon',
										remixicon: 'RiCloseLine'
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardContent($$renderer, {
				children: ($$renderer) => {
					FieldGroup($$renderer, {
						children: ($$renderer) => {
							Field($$renderer, {
								children: ($$renderer) => {
									FieldLabel($$renderer, {
										for: 'preferred-currency',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Preferred Currency`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Select($$renderer, {
										type: 'single',
										items: CURRENCIES,
										value: 'usd',
										children: ($$renderer) => {
											SelectTrigger($$renderer, {
												id: 'preferred-currency',
												class: 'w-full',
												children: ($$renderer) => {
													$$renderer.push(`<!---->USD — United States Dollar`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											SelectContent($$renderer, {
												class: 'w-(--bits-select-anchor-width)',
												children: ($$renderer) => {
													SelectGroup($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(CURRENCIES);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let item = each_array[$$index];

																SelectItem($$renderer, {
																	value: item.value,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(item.label)}`);
																	},
																	$$slots: { default: true }
																});
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
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

							$$renderer.push(`<!----> `);

							Field($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-baseline justify-between">`);

									FieldLabel($$renderer, {
										id: 'min-payout-label',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Minimum Payout Amount`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <span class="text-2xl font-semibold tabular-nums">$2500.00</span></div> `);

									Progress($$renderer, {
										value: 25,
										'aria-labelledby': 'min-payout-label',
										'aria-valuetext': '$2,500 of $10,000'
									});

									$$renderer.push(`<!----> <div class="flex items-center justify-between">`);

									FieldDescription($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->$50 (MIN)`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									FieldDescription($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->$10,000 (MAX)`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Field($$renderer, {
								children: ($$renderer) => {
									FieldLabel($$renderer, {
										for: 'payout-notes',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Notes`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Textarea($$renderer, {
										id: 'payout-notes',
										placeholder: 'Add any notes for this payout configuration...',
										class: 'min-h-[100px]'
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CardFooter($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						class: 'w-full',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Save Threshold`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}