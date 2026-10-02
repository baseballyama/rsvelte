import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Button } from '$lib/elements/forms';

import {
	Empty,
	EmptySearch,
	AvatarInitials,
	SearchQuery,
	PaginationWithLimit,
	MultiSelectionTable
} from '$lib/components';

import Create from '../createTeam.svelte';
import { goto } from '$app/navigation';
import { Container } from '$lib/layout';
import { base } from '$app/paths';
import { writable } from 'svelte/store';
import { canWriteTeams } from '$lib/stores/roles';
import { Icon, Layout, Table } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';

export let showCreateTeam = writable(false);

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		const columns = writable([
			{
				id: 'name',
				title: 'Name',
				type: 'string',
				width: { min: 200, max: 300 }
			},

			{
				id: 'members',
				title: 'Members',
				type: 'string',
				width: { min: 120, max: 150 }
			},

			{
				id: 'created',
				title: 'Created',
				type: 'string',
				width: { min: 120, max: 180 }
			}
		]);

		const teamCreated = async (event) => {
			await goto(`${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${event.detail.$id}`);
		};

		async function handleDelete(batchDelete) {
			const result = await batchDelete((teamId) => sdk.forProject(page.params.region, page.params.project).teams.delete({ teamId }));

			try {
				if (result.error) {
					trackError(result.error, Submit.TeamDelete);
				} else {
					trackEvent(Submit.TeamDelete, { total: result.deleted.length });
				}
			} finally {
				await invalidate(Dependencies.TEAMS);
			}

			return result;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							justifyContent: 'space-between',
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										alignItems: 'center',
										children: ($$renderer) => {
											SearchQuery($$renderer, { placeholder: 'Search by name' });
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										alignItems: 'center',
										justifyContent: 'flex-end',
										children: ($$renderer) => {
											Button($$renderer, {
												event: 'create_user',
												size: 's',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Create team`);
												},

												$$slots: {
													default: true,
													start: ($$renderer) => {
														Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
													}
												}
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (data.teams.total) {
						$$renderer.push('<!--[0-->');

						{
							function header($$renderer, root) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let { id, title } = each_array[$$index];

									if (Table.Header.Cell) {
										$$renderer.push('<!--[-->');

										Table.Header.Cell($$renderer, {
											column: id,
											root,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(title)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]-->`);
							}

							function children($$renderer, root) {
								const TableRowComponent = $.store_get($$store_subs ??= {}, '$canWriteTeams', canWriteTeams) ? Table.Row.Link : Table.Row.Base;

								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(data.teams.teams);

								for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
									let team = each_array_1[$$index_2];

									const href = $.store_get($$store_subs ??= {}, '$canWriteTeams', canWriteTeams)
										? `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${team.$id}`
										: undefined;

									if (TableRowComponent) {
										$$renderer.push('<!--[-->');

										TableRowComponent($$renderer, {
											root,
											href,
											id: team.$id,
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

												for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
													let column = each_array_2[$$index_1];

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: column.id,
															root,
															children: ($$renderer) => {
																if (column.id === 'name') {
																	$$renderer.push('<!--[0-->');

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			alignItems: 'center',
																			children: ($$renderer) => {
																				AvatarInitials($$renderer, { size: 'xs', name: team.name });
																				$$renderer.push(`<!----> <span class="u-trim">${$.escape(team.name)}</span>`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																} else if (column.id === 'members') {
																	$$renderer.push(`<!--[1-->${$.escape(team.total)} members`);
																} else if (column.id === 'created') {
																	$$renderer.push('<!--[2-->');
																	DualTimeView($$renderer, { time: team.$createdAt });
																} else {
																	$$renderer.push('<!--[-1-->');
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
								}

								$$renderer.push(`<!--]-->`);
							}

							function deleteContentNotice($$renderer) {
								$$renderer.push(`<!---->This action is irreversible and will permanently remove the selected teams and all
                their memberships.`);
							}

							MultiSelectionTable($$renderer, {
								resource: 'team',
								columns: $.store_get($$store_subs ??= {}, '$columns', columns),
								onDelete: handleDelete,
								allowSelection: $.store_get($$store_subs ??= {}, '$canWriteTeams', canWriteTeams),
								header,
								children,
								deleteContentNotice,
								$$slots: { header: true, default: true, deleteContentNotice: true }
							});
						}

						$$renderer.push(`<!----> `);

						PaginationWithLimit($$renderer, {
							name: 'Teams',
							limit: data.limit,
							offset: data.offset,
							total: data.teams.total
						});

						$$renderer.push(`<!---->`);
					} else if (data.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							target: 'teams',
							search: data.search,
							hidePagination: data.teams.total === 0,
							children: ($$renderer) => {
								Button($$renderer, {
									size: 's',
									secondary: true,
									href: `${base}/project-${page.params.region}-${page.params.project}/auth/teams`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear Search`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Empty($$renderer, {
							single: true,
							allowCreate: $.store_get($$store_subs ??= {}, '$canWriteTeams', canWriteTeams),
							href: 'https://appwrite.io/docs/references/cloud/client-web/teams',
							target: 'team'
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Create($$renderer, {
				get showCreate() {
					return $.store_get($$store_subs ??= {}, '$showCreateTeam', showCreateTeam);
				},

				set showCreate($$value) {
					$.store_set(showCreateTeam, $$value);
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