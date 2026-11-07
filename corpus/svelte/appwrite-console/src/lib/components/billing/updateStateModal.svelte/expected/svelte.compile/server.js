import * as $ from 'svelte/internal/server';
import { Modal } from '$lib/components';
import { Button, InputSelect } from '$lib/elements/forms';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { states } from './state';
import { Alert, Card, Layout, Typography } from '@appwrite.io/pink-svelte';
import { CreditCardBrandImage } from '../index.js';

export default function UpdateStateModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = false, paymentMethod } = $$props;
		let selectedState = '';
		let isSubmitting = false;
		let error = null;

		async function handleSubmit() {
			if (!selectedState) {
				error = 'Please select a state';

				return;
			}

			isSubmitting = true;
			error = null;

			try {
				await sdk.forConsole.account.updatePaymentMethod({
					paymentMethodId: paymentMethod.$id,
					expiryMonth: paymentMethod.expiryMonth,
					expiryYear: paymentMethod.expiryYear,
					state: selectedState
				});

				trackEvent(Submit.PaymentMethodUpdate);
				await invalidate(Dependencies.PAYMENT_METHODS);

				addNotification({
					type: 'success',
					message: 'Payment method state has been updated'
				});

				show = false;
			} catch(e) {
				error = e.message;
				trackError(e, Submit.PaymentMethodUpdate);
			} finally {
				isSubmitting = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				onSubmit: handleSubmit,
				title: 'Update payment method state',
				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'column',
							gap: 'm',
							children: ($$renderer) => {
								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->State information is required for US payment methods to apply correct taxes and meet
            U.S. legal requirements.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (paymentMethod) {
									$$renderer.push('<!--[0-->');

									if (Card.Base) {
										$$renderer.push('<!--[-->');

										Card.Base($$renderer, {
											variant: 'secondary',
											padding: 's',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														alignItems: 'center',
														gap: 's',
														children: ($$renderer) => {
															CreditCardBrandImage($$renderer, { brand: paymentMethod.brand });
															$$renderer.push(`<!----> <span>ending in ${$.escape(paymentMethod.last4)}</span>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														size: 's',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(paymentMethod.country)}`);
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
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (Alert.Inline) {
									$$renderer.push('<!--[-->');

									Alert.Inline($$renderer, {
										status: 'info',
										title: 'State is required for US payment methods',
										children: ($$renderer) => {
											if (Typography.Text) {
												$$renderer.push('<!--[-->');

												Typography.Text($$renderer, {
													size: 's',
													children: ($$renderer) => {
														$$renderer.push(`<!---->To complete the billing information, select your state so we can apply the correct
                taxes and meet U.S. legal requirements.`);
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

								InputSelect($$renderer, {
									required: true,
									label: 'State',
									placeholder: 'Select a state',
									id: 'state-picker',
									options: states.map((stateOption) => ({
										label: stateOption.name,
										value: stateOption.abbreviation,
										id: stateOption.abbreviation.toLowerCase()
									})),

									get value() {
										return selectedState;
									},

									set value($$value) {
										selectedState = $$value;
										$$settled = false;
									}
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

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								submit: true,
								disabled: !selectedState || isSubmitting,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Save`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { show });
	});
}