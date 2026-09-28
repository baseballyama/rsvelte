import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { resolve } from '$app/paths';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { confirmPayment } from '$lib/stores/stripe';
import { organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { formatCurrency } from '$lib/helpers/numbers';

var root = $.from_html(
	`<p class="text">By clicking <b>Accept & Enable</b>, the amount of <b> </b> will be added to your subscription and
            your payment method will be charged <b> </b> for the remaining days in your
            billing cycle.</p> <p class="text u-margin-block-start-16">Your action confirms acceptance of Appwrite's <a class="link" target="_blank" rel="noopener noreferrer">Business Associate Agreement</a> and related terms.</p> <div class="price-breakdown u-margin-block-start-24 svelte-1wgjfr3"><div class="price-row svelte-1wgjfr3"><span class="text"> </span> <span class="text"> </span></div> <hr class="divider svelte-1wgjfr3"/> <div class="price-row u-bold svelte-1wgjfr3"><span class="text">Due today (prorated)</span> <span class="text"> </span></div> <p class="text u-color-text-offline u-margin-block-start-8 u-text-end svelte-1wgjfr3">* Plus applicable tax and fees</p></div>`,
	1
);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function BAAEnableModal($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15, false),
		addonPrice = $.prop($$props, 'addonPrice', 3, null);

	const BAA_AGREEMENT_URL = 'https://appwrite.io/legal/baa';
	let error = $.state(null);
	let submitting = $.state(false);

	async function handleSubmit() {
		$.set(submitting, true);
		$.set(error, null);

		try {
			const result = await sdk.forConsole.organizations.createBaaAddon({ organizationId: $organization().$id });

			if ('clientSecret' in result) {
				const paymentAuth = result;
				const settingsUrl = resolve('/(console)/organization-[organization]/settings', { organization: $organization().$id });

				const outcome = await confirmPayment({
					clientSecret: paymentAuth.clientSecret,
					paymentMethodId: $organization().paymentMethodId,
					orgId: $organization().$id,
					route: `${settingsUrl}?type=confirm-addon&addonId=${paymentAuth.addonId}`,
					redirectIfRequired: true
				});

				if (!outcome || outcome.status === 'error') {
					if (outcome?.status === 'error') {
						$.set(error, outcome.message, true);
						trackError(new Error(outcome.message), Submit.BAAAddonEnable);
					}

					return;
				}

				if (outcome.status === 'requires_action') {
					return;
				}

				await sdk.forConsole.organizations.confirmAddonPayment({
					organizationId: $organization().$id,
					addonId: paymentAuth.addonId
				});

				await Promise.all([
					invalidate(Dependencies.ADDONS),
					invalidate(Dependencies.ORGANIZATION)
				]);

				if (outcome.status === 'processing') {
					addNotification({
						message: "BAA addon payment is processing — we'll activate it shortly.",
						type: 'info'
					});
				} else {
					addNotification({ message: 'BAA addon has been enabled', type: 'success' });
				}

				trackEvent(Submit.BAAAddonEnable);
				show(false);

				return;
			}

			await Promise.all([
				invalidate(Dependencies.ADDONS),
				invalidate(Dependencies.ORGANIZATION)
			]);

			addNotification({ message: 'BAA addon has been enabled', type: 'success' });
			trackEvent(Submit.BAAAddonEnable);
			show(false);
		} catch(e) {
			// 409 means addon already exists (pending or active from prior attempt)
			if (e?.code === 409) {
				await Promise.all([
					invalidate(Dependencies.ADDONS),
					invalidate(Dependencies.ORGANIZATION)
				]);

				addNotification({
					message: 'BAA addon is already active for your organization',
					type: 'success'
				});

				show(false);
			} else {
				$.set(error, e.message, true);
				trackError(e, Submit.BAAAddonEnable);
			}
		} finally {
			$.set(submitting, false);
		}
	}

	Modal($$anchor, {
		onSubmit: handleSubmit,
		title: 'HIPAA BAA',
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
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var p = $.first_child(fragment_2);
					var b = $.sibling($.child(p), 3);
					var text = $.only_child(b, true);
					var b_1 = $.sibling(b, 2);
					var text_1 = $.only_child(b_1);

					$.next();
					$.reset(p);

					var p_1 = $.sibling(p, 2);
					var a = $.sibling($.child(p_1));

					$.set_attribute(a, 'href', BAA_AGREEMENT_URL);
					$.next();
					$.reset(p_1);

					var div = $.sibling(p_1, 2);
					var div_1 = $.child(div);
					var span = $.child(div_1);
					var text_2 = $.only_child(span, true);
					var span_1 = $.sibling(span, 2);
					var text_3 = $.only_child(span_1);

					$.reset(div_1);

					var div_2 = $.sibling(div_1, 4);
					var span_2 = $.sibling($.child(div_2), 2);
					var text_4 = $.only_child(span_2, true);

					$.reset(div_2);
					$.next(2);
					$.reset(div);

					$.template_effect(
						($0, $1, $2, $3) => {
							$.set_text(text, $0);
							$.set_text(text_1, `${$1 ?? ''} immediately`);
							$.set_text(text_2, addonPrice().name);
							$.set_text(text_3, `${$2 ?? ''} / month`);
							$.set_text(text_4, $3);
						},
						[
							() => formatCurrency(addonPrice().monthlyPrice),
							() => formatCurrency(addonPrice().proratedAmount),
							() => formatCurrency(addonPrice().monthlyPrice),
							() => formatCurrency(addonPrice().proratedAmount)
						]
					);

					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if (addonPrice()) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_3 = root_1();
				var node_1 = $.first_child(fragment_3);

				Button(node_1, {
					text: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Cancel');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => $.get(submitting) || !addonPrice());

					Button(node_2, {
						secondary: true,
						submit: true,
						get disabled() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Accept & Enable');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_3);
			}
		}
	});

	$.pop();
	$$cleanup();
}