import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { Breadcrumbs } from '$lib/layout';
import { resolveRoute } from '$lib/stores/navigation';

export default function Breadcrumbs_1($$anchor, $$props) {
	$.push($$props, true);

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

	Breadcrumbs($$anchor, {
		get breadcrumbs() {
			return $.get(breadcrumbs);
		}
	});

	$.pop();
}