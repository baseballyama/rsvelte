import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { base } from '$app/paths';
import { AvatarInitials, MultiSelectionTable } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Container } from '$lib/layout';
import DeleteMembership from '../deleteMembership.svelte';
import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { Table, Layout, Empty, Card } from '@appwrite.io/pink-svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		let showDelete = false;
		let selectedMembership = null;

		async function handleBulkDelete(batchDelete) {
			// Precompute a lookup map from membershipId to teamId for efficient access
			const membershipIdToTeamId = {};

			for (const membership of data.memberships.memberships) {
				membershipIdToTeamId[membership.$id] = membership.teamId;
			}

			const result = await batchDelete((membershipId) => sdk.forProject(page.params.region, page.params.project).teams.deleteMembership({
				teamId: membershipIdToTeamId[membershipId] || '',
				membershipId
			}));

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

									if (Table.Row.Link) {
										$$renderer.push('<!--[-->');

										Table.Row.Link($$renderer, {
											root,
											href: `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${membership.teamId}`,
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
																		AvatarInitials($$renderer, { size: 'xs', name: membership.teamName });
																		$$renderer.push(`<!----> <span>${$.escape(membership.teamName ? membership.teamName : 'n/a')}</span>`);
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
								$$renderer.push(`<!---->This action is irreversible and will remove the user from the selected teams.`);
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
					} else {
						$$renderer.push('<!--[-1-->');

						if (Card.Base) {
							$$renderer.push('<!--[-->');

							Card.Base($$renderer, {
								padding: 'none',
								children: ($$renderer) => {
									Empty($$renderer, {
										title: 'No memberships available',
										description: 'Need a hand? Learn more in our documentation.',
										type: 'secondary',
										$$slots: {
											actions: ($$renderer) => {
												{
													Button($$renderer, {
														external: true,
														secondary: true,
														href: 'https://appwrite.io/docs/products/auth/teams#create-membership',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Documentation`);
														},
														$$slots: { default: true }
													});
												}
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
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
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