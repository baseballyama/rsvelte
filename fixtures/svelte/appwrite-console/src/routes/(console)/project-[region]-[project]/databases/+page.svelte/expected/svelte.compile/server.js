import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { page } from '$app/state';
import { Empty, PaginationWithLimit } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Container, ResponsiveContainerHeader } from '$lib/layout';
import Create from './create.svelte';
import Grid from './grid.svelte';
import { columns } from './store';
import Table from './table.svelte';
import { Icon, Tooltip } from '@appwrite.io/pink-svelte';
import { registerCommands } from '$lib/commandCenter';
import { canWriteDatabases } from '$lib/stores/roles';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import EmptySearch from '$lib/components/emptySearch.svelte';
import { isServiceLimited } from '$lib/stores/billing';
import { organization } from '$lib/stores/organization';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE } from '$lib/helpers/tooltipContent';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import EmptyDatabaseCloud from './empty.svelte';
import { flags } from '$lib/flags';
import { user } from '$lib/stores/user';
import { project } from '../store';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let showCreate = false;

		const isMultiDb = $.derived(() => flags.multiDb({
			account: $.store_get($$store_subs ??= {}, '$user', user),
			organization: $.store_get($$store_subs ??= {}, '$organization', organization)
		}));

		const isLimited = $.derived(() => isServiceLimited('databases', $.store_get($$store_subs ??= {}, '$organization', organization), data.databases.total));

		async function handleCreate(event) {
			showCreate = false;
			await goto(resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', { ...page.params, database: event.detail.$id }));
		}

		async function goToCreateDatabaseWizard() {
			await goto(resolveRoute('/(console)/project-[region]-[project]/databases/create', page.params));
		}

		function triggerCreate() {
			if (isMultiDb()) {
				goToCreateDatabaseWizard();
			} else {
				showCreate = true;
			}
		}

		function containerHeader($$renderer) {
			ResponsiveContainerHeader($$renderer, {
				hasSearch: true,
				columns,
				view: data.view,
				searchPlaceholder: 'Search by name or ID',
				children: ($$renderer) => {
					if ($.store_get($$store_subs ??= {}, '$canWriteDatabases', canWriteDatabases)) {
						$$renderer.push('<!--[0-->');

						Tooltip($$renderer, {
							disabled: !isLimited(),
							maxWidth: BODY_TOOLTIP_MAX_WIDTH,
							children: ($$renderer) => {
								$$renderer.push(`<div>`);

								Button($$renderer, {
									disabled: isLimited(),
									event: 'create_database',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Create database`);
									},

									$$slots: {
										default: true,
										start: ($$renderer) => {
											Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
										}
									}
								});

								$$renderer.push(`<!----></div>`);
							},

							$$slots: {
								default: true,
								tooltip: ($$renderer) => {
									{
										$$renderer.push(`<div${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE_PRELINE)}>You have reached the maximum number of databases for your plan.</div>`);
									}
								}
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					containerHeader($$renderer);
					$$renderer.push(`<!----> `);

					if (data.databases.total) {
						$$renderer.push('<!--[0-->');

						if (data.view === 'grid') {
							$$renderer.push('<!--[0-->');
							Grid($$renderer, { data, onCreateDatabaseClick: triggerCreate });
						} else {
							$$renderer.push('<!--[-1-->');

							Table($$renderer, {
								entities: data.entities,
								policies: data.policies,
								databases: data.databases,
								lastBackups: data.lastBackups
							});
						}

						$$renderer.push(`<!--]--> `);

						PaginationWithLimit($$renderer, {
							name: 'Databases',
							limit: data.limit,
							offset: data.offset,
							total: data.databases.total
						});

						$$renderer.push(`<!---->`);
					} else if (data.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							target: 'databases',
							hidePagination: true,
							children: ($$renderer) => {
								Button($$renderer, {
									href: resolveRoute('/(console)/project-[region]-[project]/databases', page.params),
									size: 's',
									secondary: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear Search`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					} else if (isMultiDb()) {
						$$renderer.push('<!--[2-->');

						EmptyDatabaseCloud($$renderer, {
							disabled: $.store_get($$store_subs ??= {}, '$canWriteDatabases', canWriteDatabases),
							onDatabaseTypeSelected: async (type) => {
								await goto(withPath(resolveRoute('/(console)/project-[region]-[project]/databases/create', page.params), `?type=${type}`));
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Empty($$renderer, {
							single: true,
							target: 'database',
							allowCreate: $.store_get($$store_subs ??= {}, '$canWriteDatabases', canWriteDatabases)
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Create($$renderer, {
				project: $.store_get($$store_subs ??= {}, '$project', project),
				get showCreate() {
					return showCreate;
				},

				set showCreate($$value) {
					showCreate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}