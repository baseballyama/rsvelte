import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Breadcrumbs } from '$lib/layout';
import { getTerminologies } from '$database/(entity)';
import { resolveRoute, withPath } from '$lib/stores/navigation';

export default function Breadcrumbs_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { terminology } = getTerminologies();
		const entity = terminology.entity;
		const entityType = terminology.entity.lower.singular;
		const database = $.derived(() => page.data.database);
		const entityObject = $.derived(() => page.data[entityType]);

		const breadcrumbs = $.derived(() => {
			const params = page.params;
			const entityId = params[entityType];
			const databases = resolveRoute('/(console)/project-[region]-[project]/databases', params);
			const databasePath = resolveRoute(`/(console)/project-[region]-[project]/databases/database-[database]`, params);

			return [
				{ title: '...' },
				{ href: databases, title: 'Databases' },
				{ href: databasePath, title: database()?.name ?? 'Database' },
				{
					href: withPath(databasePath, `/${entityType}-${entityId}`),
					title: entityObject()?.name ?? entity.title.singular
				}
			];
		});

		Breadcrumbs($$renderer, { breadcrumbs: breadcrumbs() });
	});
}