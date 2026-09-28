import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto, invalidate } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';

import {
	addSubPanel,
	registerCommands,
	registerSearchers,
	updateCommandGroupRanks
} from '$lib/commandCenter';

import { tablesSearcher } from '$lib/commandCenter/searchers';
import { Dependencies } from '$lib/constants';

import {
	showCreateEntity,
	randomDataModalState,
	resetSampleFieldsConfig
} from './store';

import { entityColumnSuggestions } from './(suggestions)/store';
import { TablesPanel } from '$lib/commandCenter/panels';
import { canWriteTables, canWriteDatabases } from '$lib/stores/roles';
import { showCreateBackup, showCreatePolicy } from './backups/store';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { currentPlan } from '$lib/stores/organization';
import { isCloud } from '$lib/system';
import { noWidthTransition } from '$lib/stores/sidebar';
import { CreateEntity, getTerminologies } from '$database/(entity)';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import { Layout } from '@appwrite.io/pink-svelte';
import { Button, Seekbar } from '$lib/elements/forms';
import { Input as SuggestionsInput } from '$database/(suggestions)/index';
import { Modal } from '$lib/components';
import { subNavigation } from '$lib/stores/database';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $noWidthTransition = () => $.store_get(noWidthTransition, '$noWidthTransition', $$stores);
	const $registerSearchers = () => $.store_get(registerSearchers, '$registerSearchers', $$stores);
	const $entityColumnSuggestions = () => $.store_get(entityColumnSuggestions, '$entityColumnSuggestions', $$stores);
	const $registerCommands = () => $.store_get(registerCommands, '$registerCommands', $$stores);
	const $showCreateEntity = () => $.store_get(showCreateEntity, '$showCreateEntity', $$stores);
	const $canWriteTables = () => $.store_get(canWriteTables, '$canWriteTables', $$stores);
	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const $canWriteDatabases = () => $.store_get(canWriteDatabases, '$canWriteDatabases', $$stores);
	const $updateCommandGroupRanks = () => $.store_get(updateCommandGroupRanks, '$updateCommandGroupRanks', $$stores);
	const $randomDataModalState = () => $.store_get(randomDataModalState, '$randomDataModalState', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const project = page.params.project;
	const databaseId = page.params.database;
	const { databaseSdk, terminology } = getTerminologies();

	$.store_set(noWidthTransition, true);
	$registerSearchers()(tablesSearcher);

	async function createEntity(entityId, name, dimension) {
		const shouldSuggestColumns = $entityColumnSuggestions().enabled;
		const entity = await databaseSdk.createEntity({ databaseId, entityId, name, dimension });

		await invalidate(Dependencies.DATABASE);
		await invalidate(Dependencies.TABLES);
		await goto(withPath(resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', page.params), `/${terminology.entity.lower.singular}-${entity.$id}`));

		subNavigation.update({
			type: 'entity-created',
			entity: { $id: entity.$id, name: entity.name }
		});

		if (shouldSuggestColumns) {
			entityColumnSuggestions.update((store) => ({
				...store,
				enabled: true,
				thinking: true,
				force: true,
				entity: { id: entity.$id, name: entity.name }
			}));
		}
	}

	$.user_effect(() => {
		$registerCommands()([
			{
				label: 'Create table',
				callback() {
					$.store_set(showCreateEntity, true);

					if (!page.url.pathname.endsWith(databaseId)) {
						goto(`${base}/project-${page.params.region}-${project}/databases/database-${databaseId}`);
					}
				},
				keys: page.url.pathname.endsWith(databaseId) ? ['c'] : ['c', 'c'],
				disabled: page.route.id?.includes('table-') || !$canWriteTables(),
				group: 'databases',
				icon: IconPlus
			},

			{
				label: 'Create backup policy',
				callback: async () => {
					if (!page.url.pathname.endsWith('backups')) {
						goto(`${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/backups`);
					}

					showCreatePolicy.set(true);
				},
				keys: page.url.pathname.endsWith('backups') ? ['c'] : ['c', 'p'],
				group: 'databases',
				icon: IconPlus,
				rank: page.url.pathname.endsWith('backups') ? 10 : 0,
				disabled: !isCloud || !$currentPlan()?.backupsEnabled
			},

			{
				label: 'Create manual backup',
				callback: async () => {
					if (!page.url.pathname.endsWith('backups')) {
						goto(`${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/backups`);
					}

					showCreateBackup.set(true);
				},
				keys: page.url.pathname.endsWith('backups') ? ['c'] : ['c', 'b'],
				group: 'databases',
				icon: IconPlus,
				rank: page.url.pathname.endsWith('backups') ? 10 : 0,
				disabled: !isCloud || !$currentPlan()?.backupsEnabled
			},

			{
				label: 'Go to tables',
				callback() {
					goto(`${base}/project-${page.params.region}-${project}/databases/database-${databaseId}`);
				},
				disabled: page.url.pathname.endsWith(databaseId) || page.url.pathname.includes('table-'),
				keys: ['g', 'c'],
				group: 'databases'
			},

			{
				label: 'Go to backups',
				callback() {
					goto(`${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/backups`);
				},
				disabled: page.url.pathname.includes('/backups') || page.url.pathname.includes('table-'),
				keys: ['g', 'b'],
				group: 'databases'
			},

			{
				label: 'Go to settings',
				callback() {
					goto(`${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/settings`);
				},
				disabled: page.url.pathname.includes('/settings') || page.url.pathname.includes('table-') || !$canWriteDatabases(),
				keys: ['g', 's'],
				group: 'databases'
			},

			{
				label: 'Find tables',
				callback: () => {
					addSubPanel(TablesPanel);
				},
				group: 'databases',
				rank: -1
			}
		]);
	});

	$.user_effect(() => {
		$updateCommandGroupRanks()({ tables: 10 });
	});

	var fragment_1 = root_1();

	$.head('1gdgmiq', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.key(node, () => page.url.pathname, ($$anchor) => {
			$.effect(() => {
				$.document.title = 'Database - Appwrite';
			});
		});

		$.append($$anchor, fragment);
	});

	var node_1 = $.first_child(fragment_1);

	$.snippet(node_1, () => $$props.children);

	var node_2 = $.sibling(node_1, 2);

	CreateEntity(node_2, {
		onCreateEntity: createEntity,
		get show() {
			$.mark_store_binding();

			return $showCreateEntity();
		},

		set show($$value) {
			$.store_set(showCreateEntity, $$value);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			Modal($$anchor, {
				title: 'Generate sample data',
				get show() {
					return $randomDataModalState().show;
				},

				set show($$value) {
					$.store_mutate(randomDataModalState, $.untrack($randomDataModalState).show = $$value, $.untrack($randomDataModalState));
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							style: 'gap: 28px;',
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										{
											let $0 = $.derived(() => !terminology.schema);

											SuggestionsInput($$anchor, {
												required: true,
												context: 'data',
												get showSampleCountPicker() {
													return $.get($0);
												}
											});
										}
									};

									var alternate = ($$anchor) => {
										Seekbar($$anchor, {
											max: 100,
											breakpointCount: 5,
											get value() {
												return $randomDataModalState().value;
											},

											set value($$value) {
												$.store_mutate(randomDataModalState, $.untrack($randomDataModalState).value = $$value, $.untrack($randomDataModalState));
											}
										});
									};

									$.if(node_5, ($$render) => {
										if ($randomDataModalState().columns) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},

				$$slots: {
					default: true,
					footer: ($$anchor, $$slotProps) => {
						var fragment_7 = $.comment();
						var node_6 = $.first_child(fragment_7);

						$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								gap: 's',
								justifyContent: 'flex-end',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_7 = $.first_child(fragment_8);

									Button(node_7, {
										text: true,
										$$events: { click: () => resetSampleFieldsConfig() },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Cancel');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									var node_8 = $.sibling(node_7, 2);

									Button(node_8, {
										$$events: {
											click: async () => {
												$.store_mutate(randomDataModalState, $.untrack($randomDataModalState).show = false, $.untrack($randomDataModalState));
												await $randomDataModalState().onSubmit?.();
												resetSampleFieldsConfig();
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Create');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					}
				}
			});
		};

		$.if(node_3, ($$render) => {
			if (!$randomDataModalState().managed) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
	$$cleanup();
}