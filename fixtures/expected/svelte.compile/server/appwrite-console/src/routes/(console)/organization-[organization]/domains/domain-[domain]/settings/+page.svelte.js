import * as $ from 'svelte/internal/server';
import { Container } from '$lib/layout';
import DeleteDomain from './deleteDomain.svelte';
import ChangeOrganization from './changeOrganization.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		Container($$renderer, {
			children: ($$renderer) => {
				ChangeOrganization($$renderer, { domain: data.domain, organizations: data.organizations });
				$$renderer.push(`<!----> `);
				DeleteDomain($$renderer, { domain: data.domain });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}