import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { HeaderAlert } from '$lib/layout';
import { hideBillingHeaderRoutes, teamStatusUpgrading } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';

export default function PaymentProcessing($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			HeaderAlert($$anchor, {
				title: 'Payment is processing',
				type: 'info',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, `Your plan will activate within a few minutes. You can keep using ${$organization().name ?? ''} while we
        confirm the charge with your bank.`));

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => $organization()?.$id && $organization()?.status === teamStatusUpgrading && !hideBillingHeaderRoutes.includes(page.url.pathname));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}