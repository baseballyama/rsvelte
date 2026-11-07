import * as $ from 'svelte/internal/server';
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

export default function PremiumGeoDBEnableModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = false, addonPrice = null } = $$props;
		let error = null;
		let submitting = false;

		async function handleSubmit() {
			submitting = true;
			error = null;

			try {
				const result = await sdk.forConsoleIn(page.params.region).projects.createPremiumGeoDBAddon({ projectId: page.params.project });

				if ('clientSecret' in result) {
					const paymentAuth = result;
					const settingsUrl = resolve('/(console)/project-[region]-[project]/settings', { region: page.params.region, project: page.params.project });

					const outcome = await confirmPayment({
						clientSecret: paymentAuth.clientSecret,
						paymentMethodId: $.store_get($$store_subs ??= {}, '$organization', organization).paymentMethodId,
						orgId: $.store_get($$store_subs ??= {}, '$organization', organization).$id,
						route: `${settingsUrl}?type=confirm-addon&addonId=${paymentAuth.addonId}`,
						redirectIfRequired: true
					});

					if (!outcome || outcome.status === 'error') {
						if (outcome?.status === 'error') {
							error = outcome.message;
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

					show = false;

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

				show = false;
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

					show = false;
				} else {
					error = e.message;
				}
			} finally {
				submitting = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				onSubmit: handleSubmit,
				title: 'Enable Premium Geo DB',
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
					if (addonPrice) {
						$$renderer.push(`<!--[0--><p class="text">By clicking <b>Enable</b>, the amount of <b>${$.escape(formatCurrency(addonPrice.monthlyPrice))}</b> will be added to your subscription and
            your payment method will be charged <b>${$.escape(formatCurrency(addonPrice.proratedAmount))} immediately</b> for the remaining days in your
            billing cycle.</p>`);
					} else {
						$$renderer.push(`<!--[-1--><p class="text">By clicking <b>Enable</b>, your payment method will be charged for the prorated amount
            for the remaining days in your billing cycle, and the addon will be added to this
            project's subscription for future cycles.</p>`);
					}

					$$renderer.push(`<!--]--> <p class="text u-margin-block-start-16">Premium Geo DB enriches session and request data with premium geolocation details including
        timezone, postal code, ISP, connection type, and organization.</p> `);

					if (addonPrice) {
						$$renderer.push(`<!--[0--><div class="price-breakdown u-margin-block-start-24 svelte-9s7rey"><div class="price-row svelte-9s7rey"><span class="text">${$.escape(addonPrice.name)}</span> <span class="text">${$.escape(formatCurrency(addonPrice.monthlyPrice))} / month</span></div> <hr class="divider svelte-9s7rey"/> <div class="price-row u-bold svelte-9s7rey"><span class="text">Due today (prorated)</span> <span class="text">${$.escape(formatCurrency(addonPrice.proratedAmount))}</span></div> <p class="text u-color-text-offline u-margin-block-start-8 u-text-end svelte-9s7rey">* Plus applicable tax and fees</p></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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
								disabled: submitting,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Enable`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { show });
	});
}