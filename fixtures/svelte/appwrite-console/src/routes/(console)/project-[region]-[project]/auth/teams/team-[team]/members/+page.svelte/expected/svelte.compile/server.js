import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

import {
	Empty,
	EmptySearch,
	AvatarInitials,
	PaginationWithLimit,
	MultiSelectionTable
} from '$lib/components';

import { Button } from '$lib/elements/forms';
import { Container } from '$lib/layout';
import { invalidate } from '$app/navigation';
import { base } from '$app/paths';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import CreateMember from '../createMembership.svelte';
import DeleteMembership from '../deleteMembership.svelte';
import { Dependencies } from '$lib/constants';
import { Click, trackEvent, Submit, trackError } from '$lib/actions/analytics';
import { Table, Layout, Icon } from '@appwrite.io/pink-svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { sdk } from '$lib/stores/sdk';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		let showCreate = false;
		let showDelete = false;
		let selectedMembership = null;

		async function handleBulkDelete(batchDelete) {
			const result = await batchDelete((membershipId) => sdk.forProject(page.params.region, page.params.project).teams.deleteMembership({ teamId: page.params.team, membershipId }));

			try {
				if (result.error) {
					trackError(result.error, Submit.MembershipUpdate);
				} else {
					trackEvent(Submit.MembershipUpdate, { total: result.deleted.length });
				}
			} finally {
				await invalidate(Dependencies.MEMBERSHIPS);
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
							alignItems: 'center',
							justifyContent: 'flex-end',
							children: ($$renderer) => {
								Button($$renderer, {
									event: 'create_membership',
									size: 's',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Create membership`);
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

					$$renderer.push(` `);

					if (data.memberships.total) {
						$$renderer.push('<!--[0-->');

						{
							function header($$renderer, root) {
								if (Table.Header.Cell) {
									$$renderer.push('<!--[-->');

									Table.Header.Cell($$renderer, {
										column: 'name',
										root,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Table.Header.Cell) {
									$$renderer.push('<!--[-->');

									Table.Header.Cell($$renderer, {
										column: 'roles',
										root,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Roles`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Table.Header.Cell) {
									$$renderer.push('<!--[-->');

									Table.Header.Cell($$renderer, {
										column: 'joined',
										root,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Joined`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Table.Header.Cell) {
									$$renderer.push('<!--[-->');
									Table.Header.Cell($$renderer, { column: 'actions', root });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							function children($$renderer, root) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(data.memberships.memberships);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let membership = each_array[$$index];
									const username = membership.userName ? membership.userName : '-';

									if (Table.Row.Link) {
										$$renderer.push('<!--[-->');

										Table.Row.Link($$renderer, {
											root,
											href: `${base}/project-${page.params.region}-${page.params.project}/auth/user-${membership.userId}`,
											id: membership.$id,
											children: ($$renderer) => {
												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														column: 'name',
														root,
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	direction: 'row',
																	alignItems: 'center',
																	children: ($$renderer) => {
																		AvatarInitials($$renderer, { size: 'xs', name: username });
																		$$renderer.push(`<!----> <span>${$.escape(username)}</span>`);
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

												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														column: 'roles',
														root,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(membership.roles)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														column: 'joined',
														root,
														children: ($$renderer) => {
															DualTimeView($$renderer, { time: membership.joined });
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														column: 'actions',
														root,
														children: ($$renderer) => {
															$$renderer.push(`<button class="button is-only-icon is-text" aria-label="Delete item"><span class="icon-trash" aria-hidden="true"></span></button>`);
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
								}

								$$renderer.push(`<!--]-->`);
							}

							function deleteContentNotice($$renderer) {
								$$renderer.push(`<!---->This action is irreversible and will remove the selected members from this team.`);
							}

							MultiSelectionTable($$renderer, {
								resource: 'membership',
								onDelete: handleBulkDelete,
								columns: [
									{ id: 'name' },
									{ id: 'roles' },
									{ id: 'joined' },
									{ id: 'actions', width: 40 }
								],
								header,
								children,
								deleteContentNotice,
								$$slots: { header: true, default: true, deleteContentNotice: true }
							});
						}

						$$renderer.push(`<!----> `);

						PaginationWithLimit($$renderer, {
							name: 'Memberships',
							limit: data.limit,
							offset: data.offset,
							total: data.memberships.total
						});

						$$renderer.push(`<!---->`);
					} else if (data.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<div class="u-text-center"><b>Sorry, we couldn't find '${$.escape(data.search)}'</b> <p>There are no members that match your search.</p></div> `);

								Button($$renderer, {
									external: true,
									href: 'https://appwrite.io/docs/products/auth/teams#create-membership',
									text: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Documentation`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									secondary: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Create membership`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Empty($$renderer, {
							single: true,
							href: 'https://appwrite.io/docs/products/auth/teams',
							target: 'membership'
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CreateMember($$renderer, {
				teamId: page.params.team,
				get showCreate() {
					return showCreate;
				},

				set showCreate($$value) {
					showCreate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			DeleteMembership($$renderer, {
				selectedMembership,
				get showDelete() {
					return showDelete;
				},

				set showDelete($$value) {
					showDelete = $$value;
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
	});
}