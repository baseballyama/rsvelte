import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { HeaderAlert } from '$lib/layout';
import { hideBillingHeaderRoutes } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';

export default function MarkedForDeletion($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			HeaderAlert($$anchor, {
				title: 'Organization flagged for deletion',
				children: ($$anchor, $$slotProps) => {
					var text = $.text();

					$.template_effect(() => $.set_text(text, `All existing projects in the ${$organization().name ?? ''} organization have been paused. This organization
            will be deleted once your upcoming invoice is processed successfully.`));

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		var d = $.derived(() => $organization()?.markedForDeletion && !hideBillingHeaderRoutes.includes(page.url.pathname));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}