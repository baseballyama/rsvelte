import * as $ from 'svelte/internal/server';
import * as Stepper from '$lib/components/ui/stepper';
import { ShoppingCart } from '@lucide/svelte';
import BookUser from '@lucide/svelte/icons/book-user';
import CreditCard from '@lucide/svelte/icons/credit-card';
import Truck from '@lucide/svelte/icons/truck';

export default function Stepper_icon($$renderer) {
	let step = 2;

	const steps = [
		{
			step: 1,
			title: 'Address',
			description: 'Add your address',
			icon: BookUser
		},

		{
			step: 2,
			title: 'Shipping',
			description: 'Select your shipping method',
			icon: Truck
		},

		{
			step: 3,
			title: 'Payment',
			description: 'Add your payment method',
			icon: CreditCard
		},

		{
			step: 4,
			title: 'Checkout',
			description: 'Confirm your order',
			icon: ShoppingCart
		}
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Stepper.Root) {
			$$renderer.push('<!--[-->');

			Stepper.Root($$renderer, {
				get step() {
					return step;
				},

				set step($$value) {
					step = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Stepper.Nav) {
						$$renderer.push('<!--[-->');

						Stepper.Nav($$renderer, {
							orientation: 'horizontal',
							class: 'w-10/12 px-4',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(steps);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let item = each_array[$$index];

									if (Stepper.Item) {
										$$renderer.push('<!--[-->');

										Stepper.Item($$renderer, {
											children: ($$renderer) => {
												if (Stepper.Trigger) {
													$$renderer.push('<!--[-->');

													Stepper.Trigger($$renderer, {
														class: 'flex flex-col items-center lg:w-[150px]',
														children: ($$renderer) => {
															if (Stepper.Indicator) {
																$$renderer.push('<!--[-->');

																Stepper.Indicator($$renderer, {
																	children: ($$renderer) => {
																		if (item.icon) {
																			$$renderer.push('<!--[-->');
																			item.icon($$renderer, {});
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

															$$renderer.push(` <div class="hidden flex-col lg:flex">`);

															if (Stepper.Title) {
																$$renderer.push('<!--[-->');

																Stepper.Title($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(item.title)}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Stepper.Description) {
																$$renderer.push('<!--[-->');

																Stepper.Description($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(item.description)}`);
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

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Stepper.Separator) {
													$$renderer.push('<!--[-->');
													Stepper.Separator($$renderer, { class: 'lg:left-[calc(60px)]' });
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}