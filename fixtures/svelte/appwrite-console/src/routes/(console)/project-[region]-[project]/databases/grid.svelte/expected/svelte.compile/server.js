import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { resolveRoute } from '$lib/stores/navigation';
import { canWriteDatabases } from '$lib/stores/roles';
import { Badge, Icon, Layout } from '@appwrite.io/pink-svelte';
import { CardContainer, GridItem1, Id } from '$lib/components';
import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
import { getDatabaseTypeTitle } from '$routes/(console)/project-[region]-[project]/databases/store';

export default function Grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data, onCreateDatabaseClick } = $$props;

		function getDatabaseRoute(database) {
			return resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', { ...page.params, database: database.$id });
		}

		CardContainer($$renderer, {
			total: data.databases.total,
			disableEmpty: !$.store_get($$store_subs ??= {}, '$canWriteDatabases', canWriteDatabases),
			event: 'database',
			service: 'databases',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(data.databases.databases);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let database = each_array[$$index];

					GridItem1($$renderer, {
						href: getDatabaseRoute(database),
						children: ($$renderer) => {
							Id($$renderer, {
								value: database.$id,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(database.$id)}`);
								},
								$$slots: { default: true }
							});
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											inline: true,
											direction: 'row',
											gap: 's',
											alignItems: 'center',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(database.name)} `);

												Badge($$renderer, {
													size: 'xs',
													variant: 'secondary',
													content: getDatabaseTypeTitle(database)
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
							},

							subtitle: ($$renderer) => {
								{
									if (data.lastBackups && data.lastBackups[database.$id]) {
										$$renderer.push(`<!--[0-->Last backup: ${$.escape(data.lastBackups[database.$id])}`);
									} else if (!data.policies || !data.policies[database.$id]) {
										$$renderer.push('<!--[1-->');

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												inline: true,
												direction: 'row',
												gap: 's',
												alignItems: 'center',
												children: ($$renderer) => {
													Icon($$renderer, { icon: IconExclamation, size: 's', color: '--bgcolor-warning' });
													$$renderer.push(`<!----> No backup policies`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									} else {
										$$renderer.push(`<!--[-1-->Last backup: No backups yet`);
									}

									$$renderer.push(`<!--]-->`);
								}
							}
						}
					});
				}

				$$renderer.push(`<!--]-->`);
			},

			$$slots: {
				default: true,
				empty: ($$renderer) => {
					{
						$$renderer.push(`<p>Create a database</p>`);
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}