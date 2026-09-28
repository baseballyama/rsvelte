import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal } from '$lib/components';
import { Button, InputRadio } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { organization, currentPlan } from '$lib/stores/organization';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import InputSelect from '$lib/elements/forms/inputSelect.svelte';
import Roles from '$lib/components/roles/roles.svelte';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import { Icon, Layout, Popover } from '@appwrite.io/pink-svelte';

import {
	roles,
	isProjectSpecificRole,
	parseProjectRole,
	buildProjectRole
} from '$lib/stores/billing';

import { isCloud, isSelfHosted } from '$lib/system';
import ProjectAccessSelector from '../projectAccessSelector.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Edit($$anchor, $$props) {
	$.push($$props, true);

	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];
	let showEdit = $.prop($$props, 'showEdit', 15, false);
	const supportsProjectRoles = $.derived(() => isCloud && !!$currentPlan()?.supportsProjectSpecificRoles);
	const defaultRole = isSelfHosted ? 'owner' : 'developer';
	let error = $.state(null);
	let accessType = $.state('all');
	let role = $.state($.proxy(defaultRole));
	let projectAccess = $.state($.proxy([]));

	$.user_effect(() => {
		if (showEdit() && $$props.selectedMember) {
			const memberRoles = $$props.selectedMember.roles ?? [];

			if ($.get(supportsProjectRoles) && memberRoles.some(isProjectSpecificRole)) {
				$.set(accessType, 'specific');

				$.set(
					projectAccess,
					memberRoles.filter(isProjectSpecificRole).map((r) => {
						const parsed = parseProjectRole(r);

						return {
							projectId: parsed?.projectId ?? '',
							roleName: parsed?.roleName ?? defaultRole
						};
					}),
					true
				);

				$.set(role, defaultRole, true);
			} else {
				$.set(accessType, 'all');
				$.set(role, memberRoles[0] ?? defaultRole, true);
				$.set(projectAccess, [], true);
			}
		}
	});

	$.user_effect(() => {
		if (!showEdit()) {
			$.set(error, null);
		}
	});

	function buildRoles() {
		if (isCloud && $.get(accessType) === 'specific') {
			return $.get(projectAccess).filter((a) => a.projectId && a.roleName).map((a) => buildProjectRole(a.projectId, a.roleName));
		}

		return [$.get(role)];
	}

	async function submit() {
		const memberRoles = buildRoles();

		if (isCloud && $.get(accessType) === 'specific' && memberRoles.length === 0) {
			$.set(error, 'Add at least one project to grant access.');

			return;
		}

		try {
			const membership = await sdk.forConsole.teams.updateMembership({
				teamId: $organization().$id,
				membershipId: $$props.selectedMember.$id,
				roles: memberRoles
			});

			await invalidate(Dependencies.ACCOUNT);
			await invalidate(Dependencies.ORGANIZATION);
			await invalidate(Dependencies.MEMBERS);
			showEdit(false);
			addNotification({ type: 'success', message: `Role has been updated` });
			trackEvent(Submit.MembershipUpdate);
			$$props.onupdated?.(membership);
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.MembershipUpdate);
		}
	}

	Modal($$anchor, {
		title: 'Edit role',
		get error() {
			return $.get(error);
		},
		size: 's',
		onSubmit: submit,
		get show() {
			return showEdit();
		},

		set show($$value) {
			showEdit($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 's',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
									Layout_Stack_1($$anchor, {
										direction: 'row',
										gap: 's',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_3 = $.first_child(fragment_4);

											InputRadio(node_3, {
												id: 'edit-access-all',
												name: 'edit-access-type',
												label: 'All projects',
												value: 'all',
												get group() {
													return $.get(accessType);
												},

												set group($$value) {
													$.set(accessType, $$value, true);
												}
											});

											var node_4 = $.sibling(node_3, 2);

											InputRadio(node_4, {
												id: 'edit-access-specific',
												name: 'edit-access-type',
												label: 'Specific projects',
												value: 'specific',
												get group() {
													return $.get(accessType);
												},

												set group($$value) {
													$.set(accessType, $$value, true);
												}
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							};

							$.if(node_1, ($$render) => {
								if ($.get(supportsProjectRoles)) $$render(consequent);
							});
						}

						var node_5 = $.sibling(node_1, 2);

						{
							var consequent_1 = ($$anchor) => {
								InputSelect($$anchor, {
									id: 'role',
									label: 'Role',
									required: true,
									get options() {
										return roles;
									},

									get value() {
										return $.get(role);
									},

									set value($$value) {
										$.set(role, $$value, true);
									},

									$$slots: {
										info: ($$anchor, $$slotProps) => {
											var fragment_6 = $.comment();
											var node_6 = $.first_child(fragment_6);

											$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
												Layout_Stack_2($$anchor, {
													direction: 'row',
													gap: 'none',
													alignItems: 'center',
													slot: 'info',
													children: ($$anchor, $$slotProps) => {
														Popover($$anchor, {
															children: $.invalid_default_snippet,
															$$slots: {
																default: ($$anchor, $$slotProps) => {
																	const toggle = $.derived(() => $$slotProps.toggle);

																	Button($$anchor, {
																		extraCompact: true,
																		size: 's',
																		$$events: {
																			click: function (...$$args) {
																				$.get(toggle)?.apply(this, $$args);
																			}
																		},

																		children: ($$anchor, $$slotProps) => {
																			Icon($$anchor, {
																				size: 's',
																				get icon() {
																					return IconInfo;
																				}
																			});
																		},
																		$$slots: { default: true }
																	});
																},

																tooltip: ($$anchor, $$slotProps) => {
																	var fragment_10 = $.comment();
																	var node_7 = $.first_child(fragment_10);

																	$.component(node_7, () => Roles, ($$anchor, $$component) => {
																		$$component($$anchor, { slot: 'tooltip' });
																	});

																	$.append($$anchor, fragment_10);
																}
															}
														});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_6);
										}
									}
								});
							};

							var alternate = ($$anchor) => {
								ProjectAccessSelector($$anchor, {
									get projectAccess() {
										return $.get(projectAccess);
									},

									set projectAccess($$value) {
										$.set(projectAccess, $$value, true);
									}
								});
							};

							$.if(node_5, ($$render) => {
								if ($.get(accessType) === 'all' || !$.get(supportsProjectRoles)) $$render(consequent_1); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_12 = root();
				var node_8 = $.first_child(fragment_12);

				Button(node_8, {
					secondary: true,
					$$events: { click: () => showEdit(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_9 = $.sibling(node_8, 2);

				Button(node_9, {
					submit: true,
					submissionLoader: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Update');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_12);
			}
		}
	});

	$.pop();
	$$cleanup();
}