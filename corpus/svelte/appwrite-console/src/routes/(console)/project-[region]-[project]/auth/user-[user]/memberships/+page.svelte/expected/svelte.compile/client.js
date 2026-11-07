import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <span> </span>`, 1);
var root_3 = $.from_html(`<button class="button is-only-icon is-text" aria-label="Delete item"><span class="icon-trash" aria-hidden="true"></span></button>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let showDelete = $.state(false);
	let selectedMembership = $.state(null);

	async function handleBulkDelete(batchDelete) {
		// Precompute a lookup map from membershipId to teamId for efficient access
		const membershipIdToTeamId = {};

		for (const membership of $$props.data.memberships.memberships) {
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

	var fragment = root_4();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					{
						const header = ($$anchor, root = $.noop) => {
							var fragment_3 = root_1();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
								Table_Header_Cell($$anchor, {
									column: 'name',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Name');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
								Table_Header_Cell_1($$anchor, {
									column: 'roles',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Roles');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_2) => {
								Table_Header_Cell_2($$anchor, {
									column: 'joined',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Joined');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_3) => {
								Table_Header_Cell_3($$anchor, {
									column: 'actions',
									get root() {
										return root();
									}
								});
							});

							$.append($$anchor, fragment_3);
						};

						const children = ($$anchor, root = $.noop) => {
							var fragment_4 = $.comment();
							var node_6 = $.first_child(fragment_4);

							$.each(node_6, 17, () => $$props.data.memberships.memberships, $.index, ($$anchor, membership) => {
								var fragment_5 = $.comment();
								var node_7 = $.first_child(fragment_5);

								{
									let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${$.get(membership).teamId}`);

									$.component(node_7, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
										Table_Row_Link($$anchor, {
											get root() {
												return root();
											},

											get href() {
												return $.get($0);
											},

											get id() {
												return $.get(membership).$id;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_1();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => Table.Cell, ($$anchor, Table_Cell) => {
													Table_Cell($$anchor, {
														column: 'name',
														get root() {
															return root();
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = $.comment();
															var node_9 = $.first_child(fragment_7);

															$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack) => {
																Layout_Stack($$anchor, {
																	direction: 'row',
																	alignItems: 'center',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = root_2();
																		var node_10 = $.first_child(fragment_8);

																		AvatarInitials(node_10, {
																			size: 'xs',
																			get name() {
																				return $.get(membership).teamName;
																			}
																		});

																		var span = $.sibling(node_10, 2);
																		var text_3 = $.only_child(span, true);

																		$.template_effect(() => $.set_text(text_3, $.get(membership).teamName ? $.get(membership).teamName : 'n/a'));
																		$.append($$anchor, fragment_8);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												var node_11 = $.sibling(node_8, 2);

												$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell_1) => {
													Table_Cell_1($$anchor, {
														column: 'roles',
														get root() {
															return root();
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text();

															$.template_effect(() => $.set_text(text_4, $.get(membership).roles));
															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_12 = $.sibling(node_11, 2);

												$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell_2) => {
													Table_Cell_2($$anchor, {
														column: 'joined',
														get root() {
															return root();
														},

														children: ($$anchor, $$slotProps) => {
															DualTimeView($$anchor, {
																get time() {
																	return $.get(membership).joined;
																}
															});
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_12, 2);

												$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_3) => {
													Table_Cell_3($$anchor, {
														column: 'actions',
														get root() {
															return root();
														},

														children: ($$anchor, $$slotProps) => {
															var button = root_3();

															$.delegated('click', button, (event) => {
																event.preventDefault();
																$.set(selectedMembership, $.get(membership), true);
																$.set(showDelete, true);
																trackEvent('click_delete_membership');
															});

															$.append($$anchor, button);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_5);
							});

							$.append($$anchor, fragment_4);
						};

						const deleteContentNotice = ($$anchor) => {
							$.next();

							var text_5 = $.text('This action is irreversible and will remove the user from the selected teams.');

							$.append($$anchor, text_5);
						};

						MultiSelectionTable($$anchor, {
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
				};

				var alternate = ($$anchor) => {
					var fragment_11 = $.comment();
					var node_14 = $.first_child(fragment_11);

					$.component(node_14, () => Card.Base, ($$anchor, Card_Base) => {
						Card_Base($$anchor, {
							padding: 'none',
							children: ($$anchor, $$slotProps) => {
								Empty($$anchor, {
									title: 'No memberships available',
									description: 'Need a hand? Learn more in our documentation.',
									type: 'secondary',
									$$slots: {
										actions: ($$anchor, $$slotProps) => {
											Button($$anchor, {
												external: true,
												secondary: true,
												href: 'https://appwrite.io/docs/products/auth/teams#create-membership',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Documentation');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										}
									}
								});
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_11);
				};

				$.if(node_1, ($$render) => {
					if ($$props.data.memberships.total) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node, 2);

	DeleteMembership(node_15, {
		get selectedMembership() {
			return $.get(selectedMembership);
		},

		get showDelete() {
			return $.get(showDelete);
		},

		set showDelete($$value) {
			$.set(showDelete, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);