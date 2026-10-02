import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';

export default function TaxId($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let taxId;

	onMount(() => {
		taxId = $organization()?.billingTaxId;
	});

	async function updateTaxId() {
		try {
			await sdk.forConsole.organizations.setBillingTaxId({ organizationId: $organization().$id, taxId });
			await invalidate(Dependencies.ORGANIZATION);

			addNotification({
				type: 'success',
				message: `${$organization().name} tax ID has been successfully updated`
			});

			trackEvent(Submit.OrganizationBillingTaxIdUpdate);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.OrganizationBillingTaxIdUpdate);
		}
	}

	Form($$anchor, {
		onSubmit: updateTaxId,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Add a tax identification number to your organization.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Tax ID');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						InputText($$anchor, {
							label: 'Tax ID',
							placeholder: 'Enter tax ID',
							id: 'taxId',
							get value() {
								return taxId;
							},

							set value($$value) {
								taxId = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => $organization()?.billingTaxId === taxId);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Update');

									$.append($$anchor, text_2);
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

	$.pop();
	$$cleanup();
}