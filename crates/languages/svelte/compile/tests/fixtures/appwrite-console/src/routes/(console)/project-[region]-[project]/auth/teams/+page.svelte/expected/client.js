import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <span class="u-trim"> </span>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $showCreateTeam = () => $.store_get(showCreateTeam, '$showCreateTeam', $$stores);
	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const $canWriteTeams = () => $.store_get(canWriteTeams, '$canWriteTeams', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	var fragment = root_1();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					justifyContent: 'space-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									SearchQuery($$anchor, { placeholder: 'Search by name' });
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
							Layout_Stack_2($$anchor, {
								direction: 'row',
								alignItems: 'center',
								justifyContent: 'flex-end',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										event: 'create_user',
										size: 's',
										$$events: { mousedown: () => $.store_set(showCreateTeam, true) },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Create team');

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
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_1, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_6 = root_1();
					var node_5 = $.first_child(fragment_6);

					{
						const header = ($$anchor, root = $.noop) => {
							var fragment_7 = $.comment();
							var node_6 = $.first_child(fragment_7);

							$.each(node_6, 1, $columns, $.index, ($$anchor, $$item) => {
								let id = () => $.get($$item).id;
								let title = () => $.get($$item).title;
								var fragment_8 = $.comment();
								var node_7 = $.first_child(fragment_8);

								$.component(node_7, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
									Table_Header_Cell($$anchor, {
										get column() {
											return id();
										},

										get root() {
											return root();
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, title()));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							});

							$.append($$anchor, fragment_7);
						};

						const children = ($$anchor, root = $.noop) => {
							const TableRowComponent = $.derived(() => $canWriteTeams() ? Table.Row.Link : Table.Row.Base);
							var fragment_10 = $.comment();
							var node_8 = $.first_child(fragment_10);

							$.each(node_8, 17, () => $$props.data.teams.teams, (team) => team.$id, ($$anchor, team) => {
								const href = $.derived(() => $canWriteTeams()
									? `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${$.get(team).$id}`
									: undefined);

								var fragment_11 = $.comment();
								var node_9 = $.first_child(fragment_11);

								$.component(node_9, () => $.get(TableRowComponent), ($$anchor, TableRowComponent_1) => {
									TableRowComponent_1($$anchor, {
										get root() {
											return root();
										},

										get href() {
											return $.get(href);
										},

										get id() {
											return $.get(team).$id;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_12 = $.comment();
											var node_10 = $.first_child(fragment_12);

											$.each(node_10, 1, $columns, $.index, ($$anchor, column) => {
												var fragment_13 = $.comment();
												var node_11 = $.first_child(fragment_13);

												$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell) => {
													Table_Cell($$anchor, {
														get column() {
															return $.get(column).id;
														},

														get root() {
															return root();
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_14 = $.comment();
															var node_12 = $.first_child(fragment_14);

															{
																var consequent = ($$anchor) => {
																	var fragment_15 = $.comment();
																	var node_13 = $.first_child(fragment_15);

																	$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																		Layout_Stack_3($$anchor, {
																			direction: 'row',
																			alignItems: 'center',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_16 = root_2();
																				var node_14 = $.first_child(fragment_16);

																				AvatarInitials(node_14, {
																					size: 'xs',
																					get name() {
																						return $.get(team).name;
																					}
																				});

																				var span = $.sibling(node_14, 2);
																				var text_2 = $.only_child(span, true);

																				$.template_effect(() => $.set_text(text_2, $.get(team).name));
																				$.append($$anchor, fragment_16);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_15);
																};

																var consequent_1 = ($$anchor) => {
																	var text_3 = $.text();

																	$.template_effect(() => $.set_text(text_3, `${$.get(team).total ?? ''} members`));
																	$.append($$anchor, text_3);
																};

																var consequent_2 = ($$anchor) => {
																	DualTimeView($$anchor, {
																		get time() {
																			return $.get(team).$createdAt;
																		}
																	});
																};

																$.if(node_12, ($$render) => {
																	if ($.get(column).id === 'name') $$render(consequent); else if ($.get(column).id === 'members') $$render(consequent_1, 1); else if ($.get(column).id === 'created') $$render(consequent_2, 2);
																});
															}

															$.append($$anchor, fragment_14);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_13);
											});

											$.append($$anchor, fragment_12);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_11);
							});

							$.append($$anchor, fragment_10);
						};

						const deleteContentNotice = ($$anchor) => {
							$.next();

							var text_4 = $.text('This action is irreversible and will permanently remove the selected teams and all\n                their memberships.');

							$.append($$anchor, text_4);
						};

						MultiSelectionTable(node_5, {
							resource: 'team',
							get columns() {
								return $columns();
							},
							onDelete: handleDelete,
							get allowSelection() {
								return $canWriteTeams();
							},
							header,
							children,
							deleteContentNotice,
							$$slots: { header: true, default: true, deleteContentNotice: true }
						});
					}

					var node_15 = $.sibling(node_5, 2);

					PaginationWithLimit(node_15, {
						name: 'Teams',
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.teams.total;
						}
					});

					$.append($$anchor, fragment_6);
				};

				var consequent_4 = ($$anchor) => {
					{
						let $0 = $.derived(() => $$props.data.teams.total === 0);

						EmptySearch($$anchor, {
							target: 'teams',
							get search() {
								return $$props.data.search;
							},

							get hidePagination() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/auth/teams`);

									Button($$anchor, {
										size: 's',
										secondary: true,
										get href() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Clear Search');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});
					}
				};

				var alternate = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						get allowCreate() {
							return $canWriteTeams();
						},
						href: 'https://appwrite.io/docs/references/cloud/client-web/teams',
						target: 'team',
						$$events: { click: () => $.store_set(showCreateTeam, true) }
					});
				};

				$.if(node_4, ($$render) => {
					if ($$props.data.teams.total) $$render(consequent_3); else if ($$props.data.search) $$render(consequent_4, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node, 2);

	Create(node_16, {
		get showCreate() {
			$.mark_store_binding();

			return $showCreateTeam();
		},

		set showCreate($$value) {
			$.store_set(showCreateTeam, $$value);
		},
		$$events: { created: teamCreated }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}