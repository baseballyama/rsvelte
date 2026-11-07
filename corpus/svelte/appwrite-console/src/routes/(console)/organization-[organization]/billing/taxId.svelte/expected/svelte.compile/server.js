import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';

export default function TaxId($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let taxId;

		onMount(() => {
			taxId = $.store_get($$store_subs ??= {}, '$organization', organization)?.billingTaxId;
		});

		async function updateTaxId() {
			try {
				await sdk.forConsole.organizations.setBillingTaxId({
					organizationId: $.store_get($$store_subs ??= {}, '$organization', organization).$id,
					taxId
				});

				await invalidate(Dependencies.ORGANIZATION);

				addNotification({
					type: 'success',
					message: `${$.store_get($$store_subs ??= {}, '$organization', organization).name} tax ID has been successfully updated`
				});

				trackEvent(Submit.OrganizationBillingTaxIdUpdate);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.OrganizationBillingTaxIdUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateTaxId,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Add a tax identification number to your organization.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Tax ID`);
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										label: 'Tax ID',
										placeholder: 'Enter tax ID',
										id: 'taxId',
										get value() {
											return taxId;
										},

										set value($$value) {
											taxId = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: $.store_get($$store_subs ??= {}, '$organization', organization)?.billingTaxId === taxId,
										submit: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}