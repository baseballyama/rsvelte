import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';

import {
	AvatarInitials,
	Copy,
	Empty,
	EmptySearch,
	MultiSelectionTable,
	PaginationWithLimit,
	SearchQuery
} from '$lib/components';

import { Button } from '$lib/elements/forms';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { Container } from '$lib/layout';
import { writable } from 'svelte/store';
import Create from './createUser.svelte';
import { Badge, Icon, Table, Layout, Typography } from '@appwrite.io/pink-svelte';
import { Tag } from '@appwrite.io/pink-svelte';
import { IconDuplicate, IconPlus } from '@appwrite.io/pink-icons-svelte';
import { canWriteUsers } from '$lib/stores/roles';
import ViewSelector from '$lib/components/viewSelector.svelte';
import { View } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { invalidate } from '$app/navigation';

export let showCreateUser = writable(false);

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		const columns = writable([
			{ id: '$id', title: 'User ID', type: 'string', width: 200 },
			{
				id: 'name',
				title: 'Name',
				type: 'string',
				width: { min: 260 }
			},

			{
				id: 'identifiers',
				title: 'Identifiers',
				type: 'string',
				width: { min: 260 }
			},

			{
				id: 'status',
				title: 'Status',
				type: 'string',
				width: { min: 140 }
			},

			{
				id: 'labels',
				title: 'Labels',
				type: 'string',
				hide: true,
				width: { min: 140 }
			},

			{
				id: 'joined',
				title: 'Joined',
				type: 'string',
				width: { min: 140 }
			},

			{
				id: 'lastActivity',
				title: 'Last activity',
				type: 'string',
				hide: true,
				width: { min: 140 }
			}
		]);

		async function userCreated(event) {
			await goto(`${base}/project-${page.params.region}-${page.params.project}/auth/user-${event.detail.$id}`);
		}

		async function handleDelete(batchDelete) {
			const result = await batchDelete((userId) => sdk.forProject(page.params.region, page.params.project).users.delete({ userId }));

			try {
				if (result.error) {
					trackError(result.error, Submit.UserDelete);
				} else {
					trackEvent(Submit.UserDelete, { total: result.deleted.length });
				}
			} finally {
				await invalidate(Dependencies.USERS);
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
											SearchQuery($$renderer, { placeholder: 'Search by name, email, phone, or ID' });
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
											ViewSelector($$renderer, { ui: 'new', view: View.Table, columns, hideView: true });
											$$renderer.push(`<!----> `);

											Button($$renderer, {
												event: 'create_user',
												size: 's',
												children: ($$renderer) => {
													$$renderer.push(`<span class="text">Create user</span>`);
												},

												$$slots: {
													default: true,
													start: ($$renderer) => {
														Icon($$renderer, { size: 's', icon: IconPlus, slot: 'start' });
													}
												}
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (data.users.total) {
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
								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(data.users.users);

								for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
									let user = each_array_1[$$index_2];

									if (Table.Row.Link) {
										$$renderer.push('<!--[-->');

										Table.Row.Link($$renderer, {
											href: `${base}/project-${page.params.region}-${page.params.project}/auth/user-${user.$id}`,
											root,
											id: user.$id,
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

												for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
													let { id } = each_array_2[$$index_1];

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: id,
															root,
															children: ($$renderer) => {
																if (id === '$id') {
																	$$renderer.push('<!--[0-->');

																	Copy($$renderer, {
																		value: user.$id,
																		event: 'user',
																		children: ($$renderer) => {
																			Tag($$renderer, {
																				size: 'xs',
																				variant: 'code',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(user.$id)}`);
																				},

																				$$slots: {
																					default: true,
																					start: ($$renderer) => {
																						Icon($$renderer, { size: 's', icon: IconDuplicate, slot: 'start' });
																					}
																				}
																			});
																		},
																		$$slots: { default: true }
																	});
																} else if (id === 'name') {
																	$$renderer.push('<!--[1-->');

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			alignItems: 'center',
																			gap: 's',
																			children: ($$renderer) => {
																				if (user.email || user.phone) {
																					$$renderer.push('<!--[0-->');

																					if (user.name) {
																						$$renderer.push('<!--[0-->');
																						AvatarInitials($$renderer, { size: 'xs', name: user.name });
																						$$renderer.push(`<!----> `);

																						if (Typography.Text) {
																							$$renderer.push('<!--[-->');

																							Typography.Text($$renderer, {
																								truncate: true,
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(user.name)}`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					} else {
																						$$renderer.push(`<!--[-1--><div class="avatar is-size-small"><span class="icon-minus-sm" aria-hidden="true"></span></div>`);
																					}

																					$$renderer.push(`<!--]-->`);
																				} else {
																					$$renderer.push(`<!--[-1--><div class="avatar is-size-small"><span class="icon-anonymous" aria-hidden="true"></span></div> `);

																					if (Typography.Text) {
																						$$renderer.push('<!--[-->');

																						Typography.Text($$renderer, {
																							truncate: true,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(user.name)}`);
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
																} else if (id === 'identifiers') {
																	$$renderer.push('<!--[2-->');

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			truncate: true,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(user.email && user.phone
																					? [user.email, user.phone].join(',')
																					: user.email || user.phone)}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																} else if (id === 'status') {
																	$$renderer.push('<!--[3-->');

																	if (user.status) {
																		$$renderer.push('<!--[0-->');

																		const success = user.emailVerification || user.phoneVerification;

																		Badge($$renderer, {
																			size: 'xs',
																			variant: 'secondary',
																			type: success ? 'success' : undefined,
																			content: user.emailVerification && user.phoneVerification
																				? 'Verified'
																				: user.emailVerification
																					? 'Verified email'
																					: user.phoneVerification ? 'Verified phone' : 'Unverified'
																		});
																	} else {
																		$$renderer.push('<!--[-1-->');

																		Badge($$renderer, {
																			size: 'xs',
																			variant: 'secondary',
																			type: 'error',
																			content: 'blocked'
																		});
																	}

																	$$renderer.push(`<!--]-->`);
																} else if (id === 'labels') {
																	$$renderer.push('<!--[4-->');

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			truncate: true,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(user.labels.join(', '))}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																} else if (id === 'joined') {
																	$$renderer.push('<!--[5-->');
																	DualTimeView($$renderer, { time: user.registration });
																} else if (id === 'lastActivity') {
																	$$renderer.push('<!--[6-->');

																	if (user.accessedAt) {
																		$$renderer.push('<!--[0-->');
																		DualTimeView($$renderer, { time: user.accessedAt });
																	} else {
																		$$renderer.push(`<!--[-1-->never`);
																	}

																	$$renderer.push(`<!--]-->`);
																} else {
																	$$renderer.push(`<!--[-1-->${$.escape(user[id])}`);
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
								$$renderer.push(`<!---->This action is irreversible and will permanently remove the selected users and all
                their data.`);
							}

							MultiSelectionTable($$renderer, {
								resource: 'user',
								columns: $.store_get($$store_subs ??= {}, '$columns', columns),
								onDelete: handleDelete,
								allowSelection: $.store_get($$store_subs ??= {}, '$canWriteUsers', canWriteUsers),
								header,
								children,
								deleteContentNotice,
								$$slots: { header: true, default: true, deleteContentNotice: true }
							});
						}

						$$renderer.push(`<!----> `);

						PaginationWithLimit($$renderer, {
							name: 'Users',
							limit: data.limit,
							offset: data.offset,
							total: data.users.total
						});

						$$renderer.push(`<!---->`);
					} else if (data.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							target: 'users',
							hidePagination: true,
							children: ($$renderer) => {
								Button($$renderer, {
									size: 's',
									secondary: true,
									href: `${base}/project-${page.params.region}-${page.params.project}/auth`,
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
							href: 'https://appwrite.io/docs/references/cloud/server-nodejs/users',
							target: 'user',
							allowCreate: $.store_get($$store_subs ??= {}, '$canWriteUsers', canWriteUsers)
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Create($$renderer, {
				get showCreate() {
					return $.store_get($$store_subs ??= {}, '$showCreateUser', showCreateUser);
				},

				set showCreate($$value) {
					$.store_set(showCreateUser, $$value);
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