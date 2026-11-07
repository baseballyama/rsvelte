import * as $ from 'svelte/internal/server';
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

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const project = page.params.project;
		const databaseId = page.params.database;
		const { databaseSdk, terminology } = getTerminologies();

		$.store_set(noWidthTransition, true);
		$.store_get($$store_subs ??= {}, '$registerSearchers', registerSearchers)(tablesSearcher);

		async function createEntity(entityId, name, dimension) {
			const shouldSuggestColumns = $.store_get($$store_subs ??= {}, '$entityColumnSuggestions', entityColumnSuggestions).enabled;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1gdgmiq', $$renderer, ($$renderer) => {
				$$renderer.push(`<!---->`);

				{
					$$renderer.title(($$renderer) => {
						$$renderer.push(`<title>Database - Appwrite</title>`);
					});
				}

				$$renderer.push(`<!---->`);
			});

			children($$renderer);
			$$renderer.push(`<!----> `);

			CreateEntity($$renderer, {
				onCreateEntity: createEntity,
				get show() {
					return $.store_get($$store_subs ??= {}, '$showCreateEntity', showCreateEntity);
				},

				set show($$value) {
					$.store_set(showCreateEntity, $$value);
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (!$.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).managed) {
				$$renderer.push('<!--[0-->');

				Modal($$renderer, {
					title: 'Generate sample data',
					get show() {
						return $.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).show;
					},

					set show($$value) {
						$.store_mutate($$store_subs ??= {}, '$randomDataModalState', randomDataModalState, $.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).show = $$value);
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								style: 'gap: 28px;',
								children: ($$renderer) => {
									if ($.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).columns) {
										$$renderer.push('<!--[0-->');

										SuggestionsInput($$renderer, {
											required: true,
											context: 'data',
											showSampleCountPicker: !terminology.schema
										});
									} else {
										$$renderer.push('<!--[-1-->');

										Seekbar($$renderer, {
											max: 100,
											breakpointCount: 5,
											get value() {
												return $.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).value;
											},

											set value($$value) {
												$.store_mutate($$store_subs ??= {}, '$randomDataModalState', randomDataModalState, $.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).value = $$value);
												$$settled = false;
											}
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},

					$$slots: {
						default: true,
						footer: ($$renderer) => {
							{
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										gap: 's',
										justifyContent: 'flex-end',
										children: ($$renderer) => {
											Button($$renderer, {
												text: true,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Cancel`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Create`);
												},
												$$slots: { default: true }
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
						}
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
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