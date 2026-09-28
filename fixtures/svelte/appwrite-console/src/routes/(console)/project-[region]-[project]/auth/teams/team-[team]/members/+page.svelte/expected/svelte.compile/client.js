import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <span> </span>`, 1);
var root_3 = $.from_html(`<button class="button is-only-icon is-text" aria-label="Delete item"><span class="icon-trash" aria-hidden="true"></span></button>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="u-text-center"><b> </b> <p>There are no members that match your search.</p></div> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let showCreate = $.state(false);
	let showDelete = $.state(false);
	let selectedMembership = $.state(null);

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

	var fragment = root_6();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_4();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end',
					children: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							event: 'create_membership',
							size: 's',
							$$events: { mousedown: () => $.set(showCreate, true) },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Create membership');

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

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_4 = root_4();
					var node_3 = $.first_child(fragment_4);

					{
						const header = ($$anchor, root = $.noop) => {
							var fragment_5 = root_1();
							var node_4 = $.first_child(fragment_5);

							$.component(node_4, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
								Table_Header_Cell($$anchor, {
									column: 'name',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Name');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
								Table_Header_Cell_1($$anchor, {
									column: 'roles',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Roles');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_2) => {
								Table_Header_Cell_2($$anchor, {
									column: 'joined',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Joined');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_3) => {
								Table_Header_Cell_3($$anchor, {
									column: 'actions',
									get root() {
										return root();
									}
								});
							});

							$.append($$anchor, fragment_5);
						};

						const children = ($$anchor, root = $.noop) => {
							var fragment_6 = $.comment();
							var node_8 = $.first_child(fragment_6);

							$.each(node_8, 17, () => $$props.data.memberships.memberships, (membership) => membership.$id, ($$anchor, membership) => {
								const username = $.derived(() => $.get(membership).userName ? $.get(membership).userName : '-');
								var fragment_7 = $.comment();
								var node_9 = $.first_child(fragment_7);

								{
									let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/auth/user-${$.get(membership).userId}`);

									$.component(node_9, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
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
												var fragment_8 = root_1();
												var node_10 = $.first_child(fragment_8);

												$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell) => {
													Table_Cell($$anchor, {
														column: 'name',
														get root() {
															return root();
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_9 = $.comment();
															var node_11 = $.first_child(fragment_9);

															$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
																Layout_Stack_1($$anchor, {
																	direction: 'row',
																	alignItems: 'center',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_2();
																		var node_12 = $.first_child(fragment_10);

																		AvatarInitials(node_12, {
																			size: 'xs',
																			get name() {
																				return $.get(username);
																			}
																		});

																		var span = $.sibling(node_12, 2);
																		var text_4 = $.only_child(span, true);

																		$.template_effect(() => $.set_text(text_4, $.get(username)));
																		$.append($$anchor, fragment_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_10, 2);

												$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell_1) => {
													Table_Cell_1($$anchor, {
														column: 'roles',
														get root() {
															return root();
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text();

															$.template_effect(() => $.set_text(text_5, $.get(membership).roles));
															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_13, 2);

												$.component(node_14, () => Table.Cell, ($$anchor, Table_Cell_2) => {
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

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => Table.Cell, ($$anchor, Table_Cell_3) => {
													Table_Cell_3($$anchor, {
														column: 'actions',
														get root() {
															return root();
														},

														children: ($$anchor, $$slotProps) => {
															var button = root_3();

															$.delegated('click', button, (event) => {
																event.preventDefault();
																$.set(showDelete, true);
																$.set(selectedMembership, $.get(membership), true);
																trackEvent(Click.MembershipDeleteClick);
															});

															$.append($$anchor, button);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_7);
							});

							$.append($$anchor, fragment_6);
						};

						const deleteContentNotice = ($$anchor) => {
							$.next();

							var text_6 = $.text('This action is irreversible and will remove the selected members from this team.');

							$.append($$anchor, text_6);
						};

						MultiSelectionTable(node_3, {
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

					var node_16 = $.sibling(node_3, 2);

					PaginationWithLimit(node_16, {
						name: 'Memberships',
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.memberships.total;
						}
					});

					$.append($$anchor, fragment_4);
				};

				var consequent_1 = ($$anchor) => {
					EmptySearch($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_14 = root_5();
							var div = $.first_child(fragment_14);
							var b = $.child(div);
							var text_7 = $.only_child(b);

							$.next(2);
							$.reset(div);

							var node_17 = $.sibling(div, 2);

							Button(node_17, {
								external: true,
								href: 'https://appwrite.io/docs/products/auth/teams#create-membership',
								text: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Documentation');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_17, 2);

							Button(node_18, {
								secondary: true,
								$$events: { click: () => $.set(showCreate, true) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Create membership');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							$.template_effect(() => $.set_text(text_7, `Sorry, we couldn't find '${$$props.data.search ?? ''}'`));
							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						href: 'https://appwrite.io/docs/products/auth/teams',
						target: 'membership',
						$$events: { click: () => $.set(showCreate, true) }
					});
				};

				$.if(node_2, ($$render) => {
					if ($$props.data.memberships.total) $$render(consequent); else if ($$props.data.search) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node, 2);

	CreateMember(node_19, {
		get teamId() {
			return page.params.team;
		},

		get showCreate() {
			return $.get(showCreate);
		},

		set showCreate($$value) {
			$.set(showCreate, $$value, true);
		},
		$$events: { created: () => invalidate(Dependencies.MEMBERSHIPS) }
	});

	var node_20 = $.sibling(node_19, 2);

	DeleteMembership(node_20, {
		get selectedMembership() {
			return $.get(selectedMembership);
		},

		get showDelete() {
			return $.get(showDelete);
		},

		set showDelete($$value) {
			$.set(showDelete, $$value, true);
		},
		$$events: { deleted: () => invalidate(Dependencies.MEMBERSHIPS) }
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);