import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<span class="text">Create user</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="avatar is-size-small"><span class="icon-minus-sm" aria-hidden="true"></span></div>`);
var root_4 = $.from_html(`<div class="avatar is-size-small"><span class="icon-anonymous" aria-hidden="true"></span></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $showCreateUser = () => $.store_get(showCreateUser, '$showCreateUser', $$stores);
	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const $canWriteUsers = () => $.store_get(canWriteUsers, '$canWriteUsers', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	var fragment = root_2();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					justifyContent: 'space-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									SearchQuery($$anchor, { placeholder: 'Search by name, email, phone, or ID' });
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
									var fragment_4 = root_2();
									var node_4 = $.first_child(fragment_4);

									ViewSelector(node_4, {
										ui: 'new',
										get view() {
											return View.Table;
										},

										get columns() {
											return columns;
										},
										hideView: true
									});

									var node_5 = $.sibling(node_4, 2);

									Button(node_5, {
										event: 'create_user',
										size: 's',
										$$events: { click: () => $.store_set(showCreateUser, true) },
										children: ($$anchor, $$slotProps) => {
											var span = root_1();

											$.append($$anchor, span);
										},

										$$slots: {
											default: true,
											start: ($$anchor, $$slotProps) => {
												Icon($$anchor, {
													size: 's',
													get icon() {
														return IconPlus;
													},
													slot: 'start'
												});
											}
										}
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_1, 2);

			{
				var consequent_11 = ($$anchor) => {
					var fragment_6 = root_2();
					var node_7 = $.first_child(fragment_6);

					{
						const header = ($$anchor, root = $.noop) => {
							var fragment_7 = $.comment();
							var node_8 = $.first_child(fragment_7);

							$.each(node_8, 1, $columns, ({ id, title }) => id, ($$anchor, $$item) => {
								let id = () => $.get($$item).id;
								let title = () => $.get($$item).title;
								var fragment_8 = $.comment();
								var node_9 = $.first_child(fragment_8);

								$.component(node_9, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
									Table_Header_Cell($$anchor, {
										get column() {
											return id();
										},

										get root() {
											return root();
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, title()));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							});

							$.append($$anchor, fragment_7);
						};

						const children = ($$anchor, root = $.noop) => {
							var fragment_10 = $.comment();
							var node_10 = $.first_child(fragment_10);

							$.each(node_10, 17, () => $$props.data.users.users, $.index, ($$anchor, user) => {
								var fragment_11 = $.comment();
								var node_11 = $.first_child(fragment_11);

								{
									let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/auth/user-${$.get(user).$id}`);

									$.component(node_11, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
										Table_Row_Link($$anchor, {
											get href() {
												return $.get($0);
											},

											get root() {
												return root();
											},

											get id() {
												return $.get(user).$id;
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_12 = $.comment();
												var node_12 = $.first_child(fragment_12);

												$.each(node_12, 1, $columns, ({ id }) => id, ($$anchor, $$item) => {
													let id = () => $.get($$item).id;
													var fragment_13 = $.comment();
													var node_13 = $.first_child(fragment_13);

													$.component(node_13, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															get column() {
																return id();
															},

															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_14 = $.comment();
																var node_14 = $.first_child(fragment_14);

																{
																	var consequent = ($$anchor) => {
																		Copy($$anchor, {
																			get value() {
																				return $.get(user).$id;
																			},
																			event: 'user',
																			children: ($$anchor, $$slotProps) => {
																				Tag($$anchor, {
																					size: 'xs',
																					variant: 'code',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_1 = $.text();

																						$.template_effect(() => $.set_text(text_1, $.get(user).$id));
																						$.append($$anchor, text_1);
																					},

																					$$slots: {
																						default: true,
																						start: ($$anchor, $$slotProps) => {
																							Icon($$anchor, {
																								size: 's',
																								get icon() {
																									return IconDuplicate;
																								},
																								slot: 'start'
																							});
																						}
																					}
																				});
																			},
																			$$slots: { default: true }
																		});
																	};

																	var consequent_3 = ($$anchor) => {
																		var fragment_19 = $.comment();
																		var node_15 = $.first_child(fragment_19);

																		$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																			Layout_Stack_3($$anchor, {
																				direction: 'row',
																				alignItems: 'center',
																				gap: 's',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_20 = $.comment();
																					var node_16 = $.first_child(fragment_20);

																					{
																						var consequent_2 = ($$anchor) => {
																							var fragment_21 = $.comment();
																							var node_17 = $.first_child(fragment_21);

																							{
																								var consequent_1 = ($$anchor) => {
																									var fragment_22 = root_2();
																									var node_18 = $.first_child(fragment_22);

																									AvatarInitials(node_18, {
																										size: 'xs',
																										get name() {
																											return $.get(user).name;
																										}
																									});

																									var node_19 = $.sibling(node_18, 2);

																									$.component(node_19, () => Typography.Text, ($$anchor, Typography_Text) => {
																										Typography_Text($$anchor, {
																											truncate: true,
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_2 = $.text();

																												$.template_effect(() => $.set_text(text_2, $.get(user).name));
																												$.append($$anchor, text_2);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_22);
																								};

																								var alternate = ($$anchor) => {
																									var div = root_3();

																									$.append($$anchor, div);
																								};

																								$.if(node_17, ($$render) => {
																									if ($.get(user).name) $$render(consequent_1); else $$render(alternate, -1);
																								});
																							}

																							$.append($$anchor, fragment_21);
																						};

																						var alternate_1 = ($$anchor) => {
																							var fragment_24 = root_4();
																							var node_20 = $.sibling($.first_child(fragment_24), 2);

																							$.component(node_20, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																								Typography_Text_1($$anchor, {
																									truncate: true,
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_3 = $.text();

																										$.template_effect(() => $.set_text(text_3, $.get(user).name));
																										$.append($$anchor, text_3);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_24);
																						};

																						$.if(node_16, ($$render) => {
																							if ($.get(user).email || $.get(user).phone) $$render(consequent_2); else $$render(alternate_1, -1);
																						});
																					}

																					$.append($$anchor, fragment_20);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_19);
																	};

																	var consequent_4 = ($$anchor) => {
																		var fragment_26 = $.comment();
																		var node_21 = $.first_child(fragment_26);

																		$.component(node_21, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																			Typography_Text_2($$anchor, {
																				truncate: true,
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text();

																					$.template_effect(($0) => $.set_text(text_4, $0), [
																						() => $.get(user).email && $.get(user).phone
																							? [$.get(user).email, $.get(user).phone].join(',')
																							: $.get(user).email || $.get(user).phone
																					]);

																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_26);
																	};

																	var consequent_6 = ($$anchor) => {
																		var fragment_28 = $.comment();
																		var node_22 = $.first_child(fragment_28);

																		{
																			var consequent_5 = ($$anchor) => {
																				const success = $.derived(() => $.get(user).emailVerification || $.get(user).phoneVerification);

																				{
																					let $0 = $.derived(() => $.get(success) ? 'success' : undefined);

																					let $1 = $.derived(() => $.get(user).emailVerification && $.get(user).phoneVerification
																						? 'Verified'
																						: $.get(user).emailVerification
																							? 'Verified email'
																							: $.get(user).phoneVerification ? 'Verified phone' : 'Unverified');

																					Badge($$anchor, {
																						size: 'xs',
																						variant: 'secondary',
																						get type() {
																							return $.get($0);
																						},

																						get content() {
																							return $.get($1);
																						}
																					});
																				}
																			};

																			var alternate_2 = ($$anchor) => {
																				Badge($$anchor, {
																					size: 'xs',
																					variant: 'secondary',
																					type: 'error',
																					content: 'blocked'
																				});
																			};

																			$.if(node_22, ($$render) => {
																				if ($.get(user).status) $$render(consequent_5); else $$render(alternate_2, -1);
																			});
																		}

																		$.append($$anchor, fragment_28);
																	};

																	var consequent_7 = ($$anchor) => {
																		var fragment_31 = $.comment();
																		var node_23 = $.first_child(fragment_31);

																		$.component(node_23, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																			Typography_Text_3($$anchor, {
																				truncate: true,
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text();

																					$.template_effect(($0) => $.set_text(text_5, $0), [() => $.get(user).labels.join(', ')]);
																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_31);
																	};

																	var consequent_8 = ($$anchor) => {
																		DualTimeView($$anchor, {
																			get time() {
																				return $.get(user).registration;
																			}
																		});
																	};

																	var consequent_10 = ($$anchor) => {
																		var fragment_34 = $.comment();
																		var node_24 = $.first_child(fragment_34);

																		{
																			var consequent_9 = ($$anchor) => {
																				DualTimeView($$anchor, {
																					get time() {
																						return $.get(user).accessedAt;
																					}
																				});
																			};

																			var alternate_3 = ($$anchor) => {
																				var text_6 = $.text('never');

																				$.append($$anchor, text_6);
																			};

																			$.if(node_24, ($$render) => {
																				if ($.get(user).accessedAt) $$render(consequent_9); else $$render(alternate_3, -1);
																			});
																		}

																		$.append($$anchor, fragment_34);
																	};

																	var alternate_4 = ($$anchor) => {
																		var text_7 = $.text();

																		$.template_effect(() => $.set_text(text_7, $.get(user)[id()]));
																		$.append($$anchor, text_7);
																	};

																	$.if(node_14, ($$render) => {
																		if (id() === '$id') $$render(consequent); else if (id() === 'name') $$render(consequent_3, 1); else if (id() === 'identifiers') $$render(consequent_4, 2); else if (id() === 'status') $$render(consequent_6, 3); else if (id() === 'labels') $$render(consequent_7, 4); else if (id() === 'joined') $$render(consequent_8, 5); else if (id() === 'lastActivity') $$render(consequent_10, 6); else $$render(alternate_4, -1);
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
								}

								$.append($$anchor, fragment_11);
							});

							$.append($$anchor, fragment_10);
						};

						const deleteContentNotice = ($$anchor) => {
							$.next();

							var text_8 = $.text('This action is irreversible and will permanently remove the selected users and all\n                their data.');

							$.append($$anchor, text_8);
						};

						MultiSelectionTable(node_7, {
							resource: 'user',
							get columns() {
								return $columns();
							},
							onDelete: handleDelete,
							get allowSelection() {
								return $canWriteUsers();
							},
							header,
							children,
							deleteContentNotice,
							$$slots: { header: true, default: true, deleteContentNotice: true }
						});
					}

					var node_25 = $.sibling(node_7, 2);

					PaginationWithLimit(node_25, {
						name: 'Users',
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.users.total;
						}
					});

					$.append($$anchor, fragment_6);
				};

				var consequent_12 = ($$anchor) => {
					EmptySearch($$anchor, {
						target: 'users',
						hidePagination: true,
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/auth`);

								Button($$anchor, {
									size: 's',
									secondary: true,
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text('Clear Search');

										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				};

				var alternate_5 = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						href: 'https://appwrite.io/docs/references/cloud/server-nodejs/users',
						target: 'user',
						get allowCreate() {
							return $canWriteUsers();
						},
						$$events: { click: () => showCreateUser.set(true) }
					});
				};

				$.if(node_6, ($$render) => {
					if ($$props.data.users.total) $$render(consequent_11); else if ($$props.data.search) $$render(consequent_12, 1); else $$render(alternate_5, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_26 = $.sibling(node, 2);

	Create(node_26, {
		get showCreate() {
			$.mark_store_binding();

			return $showCreateUser();
		},

		set showCreate($$value) {
			$.store_set(showCreateUser, $$value);
		},
		$$events: { created: userCreated }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}