import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal } from '$lib/components';
import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Alert } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function EditPaymentModal($$anchor, $$props) {
	$.push($$props, true);

	let show = $.prop($$props, 'show', 15, false),
		isLinked = $.prop($$props, 'isLinked', 3, false);

	let year = $.state(null);
	let month = $.state(null);
	let error = $.state(null);
	const currentYear = new Date().getFullYear();

	const months = Array.from({ length: 12 }, (_, i) => {
		const value = String(i + 1).padStart(2, '0');

		return { value, label: value };
	});

	const options = $.derived(() => createMonthOptions($.get(year)));

	async function handleSubmit() {
		try {
			await sdk.forConsole.account.updatePaymentMethod({
				paymentMethodId: $$props.selectedPaymentMethod.$id,
				expiryMonth: parseInt($.get(month)),
				expiryYear: $.get(year)
			});

			trackEvent(Submit.PaymentMethodUpdate);
			invalidate(Dependencies.PAYMENT_METHODS);
			show(false);
			trackEvent(Submit.PaymentMethodUpdate);
			await invalidate(Dependencies.PAYMENT_METHODS);

			addNotification({
				type: 'success',
				message: 'Your payment method has been updated'
			});
		} catch(e) {
			$.set(error, e.message, true);
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

	Modal($$anchor, {
		onSubmit: handleSubmit,
		title: 'Update payment method',
		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		get show() {
			return show();
		},

		set show($$value) {
			show($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Alert.Inline, ($$anchor, Alert_Inline) => {
						Alert_Inline($$anchor, { status: 'error', title: 'This payment method has expired' });
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if ($$props.selectedPaymentMethod?.expired) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node, 2);

			InputSelect(node_2, {
				id: 'month',
				label: 'Month',
				get options() {
					return $.get(options);
				},
				required: true,
				placeholder: 'Enter expiry month',
				get value() {
					return $.get(month);
				},

				set value($$value) {
					$.set(month, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			InputNumber(node_3, {
				id: 'year',
				label: 'Year',
				get min() {
					return currentYear;
				},
				required: true,
				placeholder: 'Enter expiry year',
				get value() {
					return $.get(year);
				},

				set value($$value) {
					$.set(year, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			description: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_4 = $.first_child(fragment_3);

				{
					var consequent_1 = ($$anchor) => {
						var text = $.text('Updates to this payment method will be applied to any linked organizations.');

						$.append($$anchor, text);
					};

					$.if(node_4, ($$render) => {
						if (isLinked()) $$render(consequent_1);
					});
				}

				$.append($$anchor, fragment_3);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_5 = $.first_child(fragment_4);

				Button(node_5, {
					secondary: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Cancel');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_6 = $.sibling(node_5, 2);

				{
					let $0 = $.derived(() => !$.get(month) || !$.get(year));

					Button(node_6, {
						submit: true,
						get disabled() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Update');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_4);
			}
		}
	});

	$.pop();
}