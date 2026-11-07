import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<p class="text">Replace the existing payment method for your organization.</p> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ReplaceCard($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	let show = $.prop($$props, 'show', 15, false),
		isBackup = $.prop($$props, 'isBackup', 3, false);

	let name = $.state(null);
	let error = $.state(null);
	let showState = $.state(false);
	let countryState = $.state(null);
	let paymentMethod = $.state(null);
	let selectedPaymentMethodId = $.state(null);
	const filteredMethods = $.derived(() => $$props.methods?.paymentMethods.filter((method) => !!method?.last4));

	const submitEvent = $.derived(() => isBackup()
		? Submit.OrganizationBackupPaymentUpdate
		: Submit.OrganizationPaymentUpdate);

	onMount(async () => {
		if (!$$props.organization.paymentMethodId && !$$props.organization.backupPaymentMethodId) {
			$.set(selectedPaymentMethodId, $$props.methods?.total ? $$props.methods.paymentMethods[0].$id : null, true);
		} else {
			$.set(
				selectedPaymentMethodId,
				isBackup()
					? $$props.organization.backupPaymentMethodId
					: $$props.organization.paymentMethodId,
				true
			);

			// If the selected payment method does not belong to the current user, select the first one.
			if ($$props.methods?.total && !$$props.methods.paymentMethods.some((method) => method.$id === $.get(selectedPaymentMethodId))) {
				$.set(selectedPaymentMethodId, $$props.methods.paymentMethods[0].$id, true);
			}
		}
	});

	async function handleSubmit() {
		try {
			if ($.get(selectedPaymentMethodId) === '$new') {
				if ($.get(showState) && !$.get(countryState)) {
					throw Error('Please select a state');
				}

				let method;

				if ($.get(showState)) {
					method = await setPaymentMethod($.get(paymentMethod).id, $.get(name), $.get(countryState));
				} else {
					const card = await submitStripeCard($.get(name), $$props.organization.$id);

					if (card && Object.hasOwn(card, 'id')) {
						if (card.card?.country === 'US') {
							$.set(paymentMethod, card, true);
							$.set(showState, true);

							return;
						}
					} else if (card && Object.hasOwn(card, '$id')) {
						method = card;
					}
				}

				$.set(selectedPaymentMethodId, method.$id, true);
			}

			isBackup()
				? await addBackupPaymentMethod($.get(selectedPaymentMethodId))
				: await addPaymentMethod($.get(selectedPaymentMethodId));

			await invalidate(Dependencies.PAYMENT_METHODS);

			addNotification({
				type: 'success',
				message: `Your ${isBackup() ? 'backup' : 'default'} payment method has been updated`
			});

			trackEvent($.get(submitEvent));
			show(false);
		} catch(err) {
			$.set(error, err.message, true);
			trackError(err, $.get(submitEvent));
		}
	}

	async function addPaymentMethod(paymentMethodId) {
		try {
			await sdk.forConsole.organizations.setDefaultPaymentMethod({ organizationId: $$props.organization.$id, paymentMethodId });
		} catch(err) {
			$.set(error, err.message, true);
		}
	}

	async function addBackupPaymentMethod(paymentMethodId) {
		try {
			await sdk.forConsole.organizations.setBackupPaymentMethod({ organizationId: $$props.organization.$id, paymentMethodId });
		} catch(err) {
			$.set(error, err.message, true);
		}
	}

	FakeModal($$anchor, {
		onSubmit: handleSubmit,
		size: 'big',
		title: 'Replace payment method',
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
			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1), 2);

			{
				let $0 = $.derived(() => $$props.organization?.paymentMethodId);
				let $1 = $.derived(() => $$props.organization?.backupPaymentMethodId);

				let $2 = $.derived(() => isBackup()
					? $$props.organization.paymentMethodId
					: $$props.organization.backupPaymentMethodId);

				PaymentBoxes(node, {
					get methods() {
						return $.get(filteredMethods);
					},

					get defaultMethod() {
						return $.get($0);
					},

					get backupMethod() {
						return $.get($1);
					},

					get disabledCondition() {
						return $.get($2);
					},

					get name() {
						return $.get(name);
					},

					set name($$value) {
						$.set(name, $$value, true);
					},

					get showState() {
						return $.get(showState);
					},

					set showState($$value) {
						$.set(showState, $$value, true);
					},

					get paymentMethod() {
						return $.get(paymentMethod);
					},

					set paymentMethod($$value) {
						$.set(paymentMethod, $$value, true);
					},

					get state() {
						return $.get(countryState);
					},

					set state($$value) {
						$.set(countryState, $$value, true);
					},

					get group() {
						return $.get(selectedPaymentMethodId);
					},

					set group($$value) {
						$.set(selectedPaymentMethodId, $$value, true);
					}
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_1 = $.first_child(fragment_2);

				Button(node_1, {
					text: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => $.get(selectedPaymentMethodId) === (isBackup()
						? $$props.organization.backupPaymentMethodId
						: $$props.organization.paymentMethodId));

					Button(node_2, {
						secondary: true,
						submit: true,
						get disabled() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Save');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_2);
			}
		}
	});

	$.pop();
}