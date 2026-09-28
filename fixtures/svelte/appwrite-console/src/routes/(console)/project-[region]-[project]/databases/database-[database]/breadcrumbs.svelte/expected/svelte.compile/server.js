import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Breadcrumbs } from '$lib/layout';
import { resolveRoute } from '$lib/stores/navigation';

export default function Breadcrumbs_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const breadcrumbs = $.derived(() => {
			const params = page.params;
			const project = page.data.project;
			const database = page.data.database;
			const organization = page.data.organization;

			return [
				{
					href: resolveRoute('/(console)/organization-[organization]', { organization: organization?.$id ?? project.teamId }),
					title: organization.name
				},

				{
					href: resolveRoute('/(console)/project-[region]-[project]', params),
					title: project.name
				},

				{
					href: resolveRoute('/(console)/project-[region]-[project]/databases', params),
					title: 'Databases'
				},

				{
					href: resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', params),
					title: database.name
				}
			];
		});

		Breadcrumbs($$renderer, { breadcrumbs: breadcrumbs() });
	});
}