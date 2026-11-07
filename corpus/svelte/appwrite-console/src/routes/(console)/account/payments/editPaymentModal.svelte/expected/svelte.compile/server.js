import * as $ from 'svelte/internal/server';
import { Modal } from '$lib/components';
import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Alert } from '@appwrite.io/pink-svelte';

export default function EditPaymentModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = false, isLinked = false, selectedPaymentMethod } = $$props;
		let year = null;
		let month = null;
		let error = null;
		const currentYear = new Date().getFullYear();

		const months = Array.from({ length: 12 }, (_, i) => {
			const value = String(i + 1).padStart(2, '0');

			return { value, label: value };
		});

		const options = $.derived(() => createMonthOptions(year));

		async function handleSubmit() {
			try {
				await sdk.forConsole.account.updatePaymentMethod({
					paymentMethodId: selectedPaymentMethod.$id,
					expiryMonth: parseInt(month),
					expiryYear: year
				});

				trackEvent(Submit.PaymentMethodUpdate);
				invalidate(Dependencies.PAYMENT_METHODS);
				show = false;
				trackEvent(Submit.PaymentMethodUpdate);
				await invalidate(Dependencies.PAYMENT_METHODS);

				addNotification({
					type: 'success',
					message: 'Your payment method has been updated'
				});
			} catch(e) {
				error = e.message;
				trackError(e, Submit.PaymentMethodUpdate);
			}
		}

		function createMonthOptions(year) {
			if (!year) return months;

			if (year === currentYear) {
				const currentMonth = new Date().getMonth() + 1;

				return months.filter((option) => parseInt(option.value) >= currentMonth);
			} else {
				return months;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				onSubmit: handleSubmit,
				title: 'Update payment method',
				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				get show() {
					return show;
				},

				set show($$value) {
					show = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (selectedPaymentMethod?.expired) {
						$$renderer.push('<!--[0-->');

						if (Alert.Inline) {
							$$renderer.push('<!--[-->');
							Alert.Inline($$renderer, { status: 'error', title: 'This payment method has expired' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					InputSelect($$renderer, {
						id: 'month',
						label: 'Month',
						options: options(),
						required: true,
						placeholder: 'Enter expiry month',
						get value() {
							return month;
						},

						set value($$value) {
							month = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					InputNumber($$renderer, {
						id: 'year',
						label: 'Year',
						min: currentYear,
						required: true,
						placeholder: 'Enter expiry year',
						get value() {
							return year;
						},

						set value($$value) {
							year = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},

				$$slots: {
					default: true,
					description: ($$renderer) => {
						{
							if (isLinked) {
								$$renderer.push(`<!--[0-->Updates to this payment method will be applied to any linked organizations.`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}
					},

					footer: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								disabled: !month || !year,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Update`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
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