import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function UpdateStateModal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15, false);
	let selectedState = $.state('');
	let isSubmitting = $.state(false);
	let error = $.state(null);

	$.user_effect(() => {
		if (!show()) {
			$.set(selectedState, '');
			$.set(error, null);
		}
	});

	async function handleSubmit() {
		if (!$.get(selectedState)) {
			$.set(error, 'Please select a state');

			return;
		}

		$.set(isSubmitting, true);
		$.set(error, null);

		try {
			await sdk.forConsole.account.updatePaymentMethod({
				paymentMethodId: $$props.paymentMethod.$id,
				expiryMonth: $$props.paymentMethod.expiryMonth,
				expiryYear: $$props.paymentMethod.expiryYear,
				state: $.get(selectedState)
			});

			trackEvent(Submit.PaymentMethodUpdate);
			await invalidate(Dependencies.PAYMENT_METHODS);

			addNotification({
				type: 'success',
				message: 'Payment method state has been updated'
			});

			show(false);
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.PaymentMethodUpdate);
		} finally {
			$.set(isSubmitting, false);
		}
	}

	Modal($$anchor, {
		onSubmit: handleSubmit,
		title: 'Update payment method state',
		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'column',
					gap: 'm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Typography.Text, ($$anchor, Typography_Text) => {
							Typography_Text($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('State information is required for US payment methods to apply correct taxes and meet\n            U.S. legal requirements.');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Card.Base, ($$anchor, Card_Base) => {
									Card_Base($$anchor, {
										variant: 'secondary',
										padding: 's',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root_1();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													direction: 'row',
													alignItems: 'center',
													gap: 's',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root();
														var node_5 = $.first_child(fragment_5);

														CreditCardBrandImage(node_5, {
															get brand() {
																return $$props.paymentMethod.brand;
															}
														});

														var span = $.sibling(node_5, 2);
														var text_1 = $.only_child(span);

														$.template_effect(() => $.set_text(text_1, `ending in ${$$props.paymentMethod.last4 ?? ''}`));
														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_4, 2);

											$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text_1) => {
												Typography_Text_1($$anchor, {
													size: 's',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text();

														$.template_effect(() => $.set_text(text_2, $$props.paymentMethod.country));
														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							};

							$.if(node_2, ($$render) => {
								if ($$props.paymentMethod) $$render(consequent);
							});
						}

						var node_7 = $.sibling(node_2, 2);

						$.component(node_7, () => Alert.Inline, ($$anchor, Alert_Inline) => {
							Alert_Inline($$anchor, {
								status: 'info',
								title: 'State is required for US payment methods',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_8 = $.first_child(fragment_7);

									$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text_2) => {
										Typography_Text_2($$anchor, {
											size: 's',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('To complete the billing information, select your state so we can apply the correct\n                taxes and meet U.S. legal requirements.');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_7, 2);

						{
							let $0 = $.derived(() => states.map((stateOption) => ({
								label: stateOption.name,
								value: stateOption.abbreviation,
								id: stateOption.abbreviation.toLowerCase()
							})));

							InputSelect(node_9, {
								required: true,
								label: 'State',
								placeholder: 'Select a state',
								id: 'state-picker',
								get options() {
									return $.get($0);
								},

								get value() {
									return $.get(selectedState);
								},

								set value($$value) {
									$.set(selectedState, $$value, true);
								}
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => !$.get(selectedState) || $.get(isSubmitting));

					Button($$anchor, {
						submit: true,
						get disabled() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Save');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});

	$.pop();
}