import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Breadcrumbs } from '$lib/layout';
import { resolveRoute } from '$lib/stores/navigation';

export default function Breadcrumbs_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const breadcrumbs = $.derived(() => {
			const project = page.data.project;
			const organization = page.data.organization;
			const organizationId = organization?.$id ?? project.teamId;

			return [
				{
					href: resolveRoute('/(console)/organization-[organization]', { organization: organizationId }),
					title: organization?.name
				},

				{
					href: resolveRoute('/(console)/project-[region]-[project]', page.params),
					title: project?.name
				},

				{
					href: resolveRoute('/(console)/project-[region]-[project]/databases', page.params),
					title: 'Databases'
				}
			];
		});

		Breadcrumbs($$renderer, { breadcrumbs: breadcrumbs() });
	});
}