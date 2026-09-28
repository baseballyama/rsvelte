import * as $ from 'svelte/internal/server';
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

export default function BAAEnableModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { show = false, addonPrice = null } = $$props;
		const BAA_AGREEMENT_URL = 'https://appwrite.io/legal/baa';
		let error = null;
		let submitting = false;

		async function handleSubmit() {
			submitting = true;
			error = null;

			try {
				const result = await sdk.forConsole.organizations.createBaaAddon({
					organizationId: $.store_get($$store_subs ??= {}, '$organization', organization).$id
				});

				if ('clientSecret' in result) {
					const paymentAuth = result;

					const settingsUrl = resolve('/(console)/organization-[organization]/settings', {
						organization: $.store_get($$store_subs ??= {}, '$organization', organization).$id
					});

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
							trackError(new Error(outcome.message), Submit.BAAAddonEnable);
						}

						return;
					}

					if (outcome.status === 'requires_action') {
						return;
					}

					await sdk.forConsole.organizations.confirmAddonPayment({
						organizationId: $.store_get($$store_subs ??= {}, '$organization', organization).$id,
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
					show = false;

					return;
				}

				await Promise.all([
					invalidate(Dependencies.ADDONS),
					invalidate(Dependencies.ORGANIZATION)
				]);

				addNotification({ message: 'BAA addon has been enabled', type: 'success' });
				trackEvent(Submit.BAAAddonEnable);
				show = false;
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

					show = false;
				} else {
					error = e.message;
					trackError(e, Submit.BAAAddonEnable);
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
				title: 'HIPAA BAA',
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
						$$renderer.push(`<!--[0--><p class="text">By clicking <b>Accept &amp; Enable</b>, the amount of <b>${$.escape(formatCurrency(addonPrice.monthlyPrice))}</b> will be added to your subscription and
            your payment method will be charged <b>${$.escape(formatCurrency(addonPrice.proratedAmount))} immediately</b> for the remaining days in your
            billing cycle.</p> <p class="text u-margin-block-start-16">Your action confirms acceptance of Appwrite's <a class="link"${$.attr('href', BAA_AGREEMENT_URL)} target="_blank" rel="noopener noreferrer">Business Associate Agreement</a> and related terms.</p> <div class="price-breakdown u-margin-block-start-24 svelte-1wgjfr3"><div class="price-row svelte-1wgjfr3"><span class="text">${$.escape(addonPrice.name)}</span> <span class="text">${$.escape(formatCurrency(addonPrice.monthlyPrice))} / month</span></div> <hr class="divider svelte-1wgjfr3"/> <div class="price-row u-bold svelte-1wgjfr3"><span class="text">Due today (prorated)</span> <span class="text">${$.escape(formatCurrency(addonPrice.proratedAmount))}</span></div> <p class="text u-color-text-offline u-margin-block-start-8 u-text-end svelte-1wgjfr3">* Plus applicable tax and fees</p></div>`);
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
								disabled: submitting || !addonPrice,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Accept &amp; Enable`);
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