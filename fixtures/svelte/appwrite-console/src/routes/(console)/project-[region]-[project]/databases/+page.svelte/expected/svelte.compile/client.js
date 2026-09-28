import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div>You have reached the maximum number of databases for your plan.</div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $registerCommands = () => $.store_get(registerCommands, '$registerCommands', $$stores);
	const $canWriteDatabases = () => $.store_get(canWriteDatabases, '$canWriteDatabases', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const containerHeader = ($$anchor) => {
		ResponsiveContainerHeader($$anchor, {
			hasSearch: true,
			get columns() {
				return columns;
			},

			get view() {
				return $$props.data.view;
			},
			searchPlaceholder: 'Search by name or ID',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						{
							let $0 = $.derived(() => !$.get(isLimited));

							Tooltip($$anchor, {
								get disabled() {
									return $.get($0);
								},

								get maxWidth() {
									return BODY_TOOLTIP_MAX_WIDTH;
								},

								children: ($$anchor, $$slotProps) => {
									var div = root();
									var node_1 = $.child(div);

									Button(node_1, {
										get disabled() {
											return $.get(isLimited);
										},
										event: 'create_database',
										$$events: { click: triggerCreate },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Create database');

											$.append($$anchor, text);
										},

										$$slots: {
											default: true,
											start: ($$anchor, $$slotProps) => {
												Icon($$anchor, {
													get icon() {
														return IconPlus;
													},
													slot: 'start',
													size: 's'
												});
											}
										}
									});

									$.reset(div);
									$.append($$anchor, div);
								},

								$$slots: {
									default: true,
									tooltip: ($$anchor, $$slotProps) => {
										var div_1 = root_1();

										$.template_effect(() => $.set_style(div_1, BODY_TOOLTIP_WRAPPER_STYLE_PRELINE));
										$.append($$anchor, div_1);
									}
								}
							});
						}
					};

					$.if(node, ($$render) => {
						if ($canWriteDatabases()) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	};

	let showCreate = $.state(false);
	const isMultiDb = $.derived(() => flags.multiDb({ account: $user(), organization: $organization() }));
	const isLimited = $.derived(() => isServiceLimited('databases', $organization(), $$props.data.databases.total));

	async function handleCreate(event) {
		$.set(showCreate, false);
		await goto(resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', { ...page.params, database: event.detail.$id }));
	}

	async function goToCreateDatabaseWizard() {
		await goto(resolveRoute('/(console)/project-[region]-[project]/databases/create', page.params));
	}

	function triggerCreate() {
		if ($.get(isMultiDb)) {
			goToCreateDatabaseWizard();
		} else {
			$.set(showCreate, true);
		}
	}

	$.user_effect(() => {
		$registerCommands()([
			{
				label: 'Create database',
				callback: () => {
					triggerCreate();
				},
				keys: ['c'],
				disabled: !$canWriteDatabases() || $.get(isLimited),
				icon: IconPlus,
				group: 'databases',
				rank: 10
			}
		]);
	});

	var fragment_4 = root_2();
	var node_2 = $.first_child(fragment_4);

	Container(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_2();
			var node_3 = $.first_child(fragment_5);

			containerHeader(node_3);

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_6 = root_2();
					var node_5 = $.first_child(fragment_6);

					{
						var consequent_1 = ($$anchor) => {
							Grid($$anchor, {
								get data() {
									return $$props.data;
								},
								onCreateDatabaseClick: triggerCreate
							});
						};

						var alternate = ($$anchor) => {
							Table($$anchor, {
								get entities() {
									return $$props.data.entities;
								},

								get policies() {
									return $$props.data.policies;
								},

								get databases() {
									return $$props.data.databases;
								},

								get lastBackups() {
									return $$props.data.lastBackups;
								}
							});
						};

						$.if(node_5, ($$render) => {
							if ($$props.data.view === 'grid') $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					var node_6 = $.sibling(node_5, 2);

					PaginationWithLimit(node_6, {
						name: 'Databases',
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.databases.total;
						}
					});

					$.append($$anchor, fragment_6);
				};

				var consequent_3 = ($$anchor) => {
					EmptySearch($$anchor, {
						target: 'databases',
						hidePagination: true,
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/databases', page.params));

								Button($$anchor, {
									get href() {
										return $.get($0);
									},
									size: 's',
									secondary: true,
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Clear Search');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				};

				var consequent_4 = ($$anchor) => {
					EmptyDatabaseCloud($$anchor, {
						get disabled() {
							return $canWriteDatabases();
						},

						onDatabaseTypeSelected: async (type) => {
							await goto(withPath(resolveRoute('/(console)/project-[region]-[project]/databases/create', page.params), `?type=${type}`));
						}
					});
				};

				var alternate_1 = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						target: 'database',
						get allowCreate() {
							return $canWriteDatabases();
						},
						$$events: { click: () => $.set(showCreate, true) }
					});
				};

				$.if(node_4, ($$render) => {
					if ($$props.data.databases.total) $$render(consequent_2); else if ($$props.data.search) $$render(consequent_3, 1); else if ($.get(isMultiDb)) $$render(consequent_4, 2); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_2, 2);

	Create(node_7, {
		get project() {
			return $project();
		},

		get showCreate() {
			return $.get(showCreate);
		},

		set showCreate($$value) {
			$.set(showCreate, $$value, true);
		},
		$$events: { created: handleCreate }
	});

	$.append($$anchor, fragment_4);
	$.pop();
	$$cleanup();
}