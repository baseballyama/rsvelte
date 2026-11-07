import * as $ from 'svelte/internal/server';
import { Button } from '$lib/elements/forms';
import { getChangePlanUrl } from '$lib/stores/billing';
import { Click, trackEvent } from '$lib/actions/analytics';
import { organization } from '$lib/stores/organization';
import { project } from '$routes/(console)/project-[region]-[project]/store';

export default function CardPlanLimit($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { service } = $$props;

		const organizationId = $.derived(() => {
			return $.store_get($$store_subs ??= {}, '$project', project).teamId ?? $.store_get($$store_subs ??= {}, '$organization', organization).$id;
		});

		$$renderer.push(`<article class="card u-grid u-cross-center u-width-full-line"><div class="u-flex u-flex-vertical u-gap-24 u-main-center u-cross-center"><p class="text u-text-center">Upgrade your plan to add more ${$.escape(service)}</p> `);

		Button($$renderer, {
			secondary: true,
			href: getChangePlanUrl(organizationId()),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Change plan`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></article>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}