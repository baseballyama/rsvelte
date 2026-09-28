import * as $ from 'svelte/internal/server';
import { WizardWithSteps } from '$lib/layout';
import { onDestroy } from 'svelte';
import { addNotification } from '$lib/stores/notifications';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { wizard } from '$lib/stores/wizard';
import { addCreditWizardSteps, addCreditWizardStore } from './store';
import AddCredit from './wizard/addCredit.svelte';
import { sdk } from '$lib/stores/sdk';
import { organization } from '$lib/stores/organization';
import PaymentDetails from './wizard/paymentDetails.svelte';

export default function AddCreditWizard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		async function onFinish() {
			await invalidate(Dependencies.CREDIT);
		}

		async function create() {
			try {
				await sdk.forConsole.organizations.setDefaultPaymentMethod({
					organizationId: $.store_get($$store_subs ??= {}, '$organization', organization).$id,
					paymentMethodId: $.store_get($$store_subs ??= {}, '$addCreditWizardStore', addCreditWizardStore).paymentMethodId
				});

				await sdk.forConsole.organizations.addCredit({
					organizationId: $.store_get($$store_subs ??= {}, '$organization', organization).$id,
					couponId: $.store_get($$store_subs ??= {}, '$addCreditWizardStore', addCreditWizardStore).coupon
				});

				addNotification({
					type: 'success',
					message: `Credit has been added to ${$.store_get($$store_subs ??= {}, '$organization', organization).name}`
				});

				await invalidate(Dependencies.CREDIT);
				await invalidate(Dependencies.ORGANIZATION);

				trackEvent(Submit.CreditRedeem, {
					coupon: $.store_get($$store_subs ??= {}, '$addCreditWizardStore', addCreditWizardStore).coupon
				});

				wizard.hide();
			} catch(e) {
				addNotification({ type: 'error', message: e.message });
				trackError(e, Submit.CreditRedeem);
			}
		}

		onDestroy(() => {
			$.store_set(addCreditWizardStore, { coupon: null, paymentMethodId: null });
		});

		$.store_get($$store_subs ??= {}, '$addCreditWizardSteps', addCreditWizardSteps).set(1, { label: 'Credits', component: AddCredit });
		$.store_get($$store_subs ??= {}, '$addCreditWizardSteps', addCreditWizardSteps).set(2, { label: 'Payment', component: PaymentDetails });

		WizardWithSteps($$renderer, {
			title: 'Add credits',
			steps: $.store_get($$store_subs ??= {}, '$addCreditWizardSteps', addCreditWizardSteps),
			finalAction: 'Add credits'
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}