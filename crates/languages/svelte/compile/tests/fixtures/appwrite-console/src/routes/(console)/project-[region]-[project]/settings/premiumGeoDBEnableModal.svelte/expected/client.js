import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { invalidate } from '$app/navigation';
import { resolve } from '$app/paths';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { confirmPayment } from '$lib/stores/stripe';
import { organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { formatCurrency } from '$lib/helpers/numbers';

var root = $.from_html(`<p class="text">By clicking <b>Enable</b>, the amount of <b> </b> will be added to your subscription and
            your payment method will be charged <b> </b> for the remaining days in your
            billing cycle.</p>`);

var root_1 = $.from_html(`<p class="text">By clicking <b>Enable</b>, your payment method will be charged for the prorated amount
            for the remaining days in your billing cycle, and the addon will be added to this
            project's subscription for future cycles.</p>`);

var root_2 = $.from_html(`<div class="price-breakdown u-margin-block-start-24 svelte-9s7rey"><div class="price-row svelte-9s7rey"><span class="text"> </span> <span class="text"> </span></div> <hr class="divider svelte-9s7rey"/> <div class="price-row u-bold svelte-9s7rey"><span class="text">Due today (prorated)</span> <span class="text"> </span></div> <p class="text u-color-text-offline u-margin-block-start-8 u-text-end svelte-9s7rey">* Plus applicable tax and fees</p></div>`);

var root_3 = $.from_html(
	`<!> <p class="text u-margin-block-start-16">Premium Geo DB enriches session and request data with premium geolocation details including
        timezone, postal code, ISP, connection type, and organization.</p> <!>`,
	1
);

var root_4 = $.from_html(`<!> <!>`, 1);

export default function PremiumGeoDBEnableModal($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let show = $.prop($$props, 'show', 15, false),
		addonPrice = $.prop($$props, 'addonPrice', 3, null);

	let error = $.state(null);
	let submitting = $.state(false);

	async function handleSubmit() {
		$.set(submitting, true);
		$.set(error, null);

		try {
			const result = await sdk.forConsoleIn(page.params.region).projects.createPremiumGeoDBAddon({ projectId: page.params.project });

			if ('clientSecret' in result) {
				const paymentAuth = result;
				const settingsUrl = resolve('/(console)/project-[region]-[project]/settings', { region: page.params.region, project: page.params.project });

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
					}

					return;
				}

				// 3DS challenge required — Stripe redirects; the settings onMount
				// handler finalizes on return via ?type=confirm-addon.
				if (outcome.status === 'requires_action') {
					return;
				}

				try {
					await sdk.forConsoleIn(page.params.region).projects.confirmAddonPayment({ projectId: page.params.project, addonId: paymentAuth.addonId });
				} catch(e) {
					// A 404 here means the Stripe webhook already consumed the invoice
					// and activated the addon (race) — the addon is enabled, so sync
					// state and assume success rather than surfacing the error.
					if (e?.type !== 'billing_invoice_not_found' && e?.type !== 'addon_not_found' && e?.code !== 404) {
						throw e;
					}
				}

				await Promise.all([
					invalidate(Dependencies.ADDONS),
					invalidate(Dependencies.PROJECT)
				]);

				if (outcome.status === 'processing') {
					addNotification({
						message: "Premium Geo DB addon payment is processing — we'll activate it shortly.",
						type: 'info'
					});
				} else {
					addNotification({
						message: 'Premium Geo DB addon has been enabled',
						type: 'success'
					});
				}

				show(false);

				return;
			}

			await Promise.all([
				invalidate(Dependencies.ADDONS),
				invalidate(Dependencies.PROJECT)
			]);

			addNotification({
				message: 'Premium Geo DB addon has been enabled',
				type: 'success'
			});

			show(false);
		} catch(e) {
			// 409 means addon already exists (pending or active from prior attempt)
			if (e?.code === 409) {
				await Promise.all([
					invalidate(Dependencies.ADDONS),
					invalidate(Dependencies.PROJECT)
				]);

				addNotification({
					message: 'Premium Geo DB addon is already active for this project',
					type: 'success'
				});

				show(false);
			} else {
				$.set(error, e.message, true);
			}
		} finally {
			$.set(submitting, false);
		}
	}

	Modal($$anchor, {
		onSubmit: handleSubmit,
		title: 'Enable Premium Geo DB',
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
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var p = root();
					var b = $.sibling($.child(p), 3);
					var text = $.only_child(b, true);
					var b_1 = $.sibling(b, 2);
					var text_1 = $.only_child(b_1);

					$.next();
					$.reset(p);

					$.template_effect(
						($0, $1) => {
							$.set_text(text, $0);
							$.set_text(text_1, `${$1 ?? ''} immediately`);
						},
						[
							() => formatCurrency(addonPrice().monthlyPrice),
							() => formatCurrency(addonPrice().proratedAmount)
						]
					);

					$.append($$anchor, p);
				};

				var alternate = ($$anchor) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				};

				$.if(node, ($$render) => {
					if (addonPrice()) $$render(consequent); else $$render(alternate, -1);
				});
			}

			var node_1 = $.sibling(node, 4);

			{
				var consequent_1 = ($$anchor) => {
					var div = root_2();
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
						($0, $1) => {
							$.set_text(text_2, addonPrice().name);
							$.set_text(text_3, `${$0 ?? ''} / month`);
							$.set_text(text_4, $1);
						},
						[
							() => formatCurrency(addonPrice().monthlyPrice),
							() => formatCurrency(addonPrice().proratedAmount)
						]
					);

					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if (addonPrice()) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_2 = root_4();
				var node_2 = $.first_child(fragment_2);

				Button(node_2, {
					text: true,
					$$events: { click: () => show(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Cancel');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var node_3 = $.sibling(node_2, 2);

				Button(node_3, {
					secondary: true,
					submit: true,
					get disabled() {
						return $.get(submitting);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Enable');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			}
		}
	});

	$.pop();
	$$cleanup();
}