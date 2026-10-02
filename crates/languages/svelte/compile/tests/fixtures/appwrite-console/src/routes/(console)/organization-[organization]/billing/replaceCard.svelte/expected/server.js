import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { FakeModal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { setPaymentMethod, submitStripeCard } from '$lib/stores/stripe';
import { onMount } from 'svelte';
import { addNotification } from '$lib/stores/notifications';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { PaymentBoxes } from '$lib/components/billing';

export default function ReplaceCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { show = false, isBackup = false, methods, organization } = $$props;
		let name = null;
		let error = null;
		let showState = false;
		let countryState = null;
		let paymentMethod = null;
		let selectedPaymentMethodId = null;
		const filteredMethods = $.derived(() => methods?.paymentMethods.filter((method) => !!method?.last4));

		const submitEvent = $.derived(() => isBackup
			? Submit.OrganizationBackupPaymentUpdate
			: Submit.OrganizationPaymentUpdate);

		onMount(async () => {
			if (!organization.paymentMethodId && !organization.backupPaymentMethodId) {
				selectedPaymentMethodId = methods?.total ? methods.paymentMethods[0].$id : null;
			} else {
				selectedPaymentMethodId = isBackup
					? organization.backupPaymentMethodId
					: organization.paymentMethodId;

				// If the selected payment method does not belong to the current user, select the first one.
				if (methods?.total && !methods.paymentMethods.some((method) => method.$id === selectedPaymentMethodId)) {
					selectedPaymentMethodId = methods.paymentMethods[0].$id;
				}
			}
		});

		async function handleSubmit() {
			try {
				if (selectedPaymentMethodId === '$new') {
					if (showState && !countryState) {
						throw Error('Please select a state');
					}

					let method;

					if (showState) {
						method = await setPaymentMethod(paymentMethod.id, name, countryState);
					} else {
						const card = await submitStripeCard(name, organization.$id);

						if (card && Object.hasOwn(card, 'id')) {
							if (card.card?.country === 'US') {
								paymentMethod = card;
								showState = true;

								return;
							}
						} else if (card && Object.hasOwn(card, '$id')) {
							method = card;
						}
					}

					selectedPaymentMethodId = method.$id;
				}

				isBackup
					? await addBackupPaymentMethod(selectedPaymentMethodId)
					: await addPaymentMethod(selectedPaymentMethodId);

				await invalidate(Dependencies.PAYMENT_METHODS);

				addNotification({
					type: 'success',
					message: `Your ${isBackup ? 'backup' : 'default'} payment method has been updated`
				});

				trackEvent(submitEvent());
				show = false;
			} catch(err) {
				error = err.message;
				trackError(err, submitEvent());
			}
		}

		async function addPaymentMethod(paymentMethodId) {
			try {
				await sdk.forConsole.organizations.setDefaultPaymentMethod({ organizationId: organization.$id, paymentMethodId });
			} catch(err) {
				error = err.message;
			}
		}

		async function addBackupPaymentMethod(paymentMethodId) {
			try {
				await sdk.forConsole.organizations.setBackupPaymentMethod({ organizationId: organization.$id, paymentMethodId });
			} catch(err) {
				error = err.message;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			FakeModal($$renderer, {
				onSubmit: handleSubmit,
				size: 'big',
				title: 'Replace payment method',
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
					$$renderer.push(`<p class="text">Replace the existing payment method for your organization.</p> `);

					PaymentBoxes($$renderer, {
						methods: filteredMethods(),
						defaultMethod: organization?.paymentMethodId,
						backupMethod: organization?.backupPaymentMethodId,
						disabledCondition: isBackup
							? organization.paymentMethodId
							: organization.backupPaymentMethodId,

						get name() {
							return name;
						},

						set name($$value) {
							name = $$value;
							$$settled = false;
						},

						get showState() {
							return showState;
						},

						set showState($$value) {
							showState = $$value;
							$$settled = false;
						},

						get paymentMethod() {
							return paymentMethod;
						},

						set paymentMethod($$value) {
							paymentMethod = $$value;
							$$settled = false;
						},

						get state() {
							return countryState;
						},

						set state($$value) {
							countryState = $$value;
							$$settled = false;
						},

						get group() {
							return selectedPaymentMethodId;
						},

						set group($$value) {
							selectedPaymentMethodId = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								text: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								secondary: true,
								submit: true,
								disabled: selectedPaymentMethodId === (isBackup
									? organization.backupPaymentMethodId
									: organization.paymentMethodId),

								children: ($$renderer) => {
									$$renderer.push(`<!---->Save`);
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