import * as $ from 'svelte/internal/server';
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

export default function Edit($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { showEdit = false, selectedMember, onupdated } = $$props;
		const supportsProjectRoles = $.derived(() => isCloud && !!$.store_get($$store_subs ??= {}, '$currentPlan', currentPlan)?.supportsProjectSpecificRoles);
		const defaultRole = isSelfHosted ? 'owner' : 'developer';
		let error = null;
		let accessType = 'all';
		let role = defaultRole;
		let projectAccess = [];

		function buildRoles() {
			if (isCloud && accessType === 'specific') {
				return projectAccess.filter((a) => a.projectId && a.roleName).map((a) => buildProjectRole(a.projectId, a.roleName));
			}

			return [role];
		}

		async function submit() {
			const memberRoles = buildRoles();

			if (isCloud && accessType === 'specific' && memberRoles.length === 0) {
				error = 'Add at least one project to grant access.';

				return;
			}

			try {
				const membership = await sdk.forConsole.teams.updateMembership({
					teamId: $.store_get($$store_subs ??= {}, '$organization', organization).$id,
					membershipId: selectedMember.$id,
					roles: memberRoles
				});

				await invalidate(Dependencies.ACCOUNT);
				await invalidate(Dependencies.ORGANIZATION);
				await invalidate(Dependencies.MEMBERS);
				showEdit = false;
				addNotification({ type: 'success', message: `Role has been updated` });
				trackEvent(Submit.MembershipUpdate);
				onupdated?.(membership);
			} catch(e) {
				error = e.message;
				trackError(e, Submit.MembershipUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Edit role',
				error,
				size: 's',
				onSubmit: submit,
				get show() {
					return showEdit;
				},

				set show($$value) {
					showEdit = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 's',
							children: ($$renderer) => {
								if (supportsProjectRoles()) {
									$$renderer.push('<!--[0-->');

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											gap: 's',
											children: ($$renderer) => {
												InputRadio($$renderer, {
													id: 'edit-access-all',
													name: 'edit-access-type',
													label: 'All projects',
													value: 'all',
													get group() {
														return accessType;
													},

													set group($$value) {
														accessType = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----> `);

												InputRadio($$renderer, {
													id: 'edit-access-specific',
													name: 'edit-access-type',
													label: 'Specific projects',
													value: 'specific',
													get group() {
														return accessType;
													},

													set group($$value) {
														accessType = $$value;
														$$settled = false;
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
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (accessType === 'all' || !supportsProjectRoles()) {
									$$renderer.push('<!--[0-->');

									InputSelect($$renderer, {
										id: 'role',
										label: 'Role',
										required: true,
										options: roles,
										get value() {
											return role;
										},

										set value($$value) {
											role = $$value;
											$$settled = false;
										},

										$$slots: {
											info: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														gap: 'none',
														alignItems: 'center',
														slot: 'info',
														children: ($$renderer) => {
															Popover($$renderer, {
																children: $.invalid_default_snippet,
																$$slots: {
																	default: ($$renderer, { toggle }) => {
																		Button($$renderer, {
																			extraCompact: true,
																			size: 's',
																			children: ($$renderer) => {
																				Icon($$renderer, { size: 's', icon: IconInfo });
																			},
																			$$slots: { default: true }
																		});
																	},

																	tooltip: ($$renderer) => {
																		if (Roles) {
																			$$renderer.push('<!--[-->');
																			Roles($$renderer, { slot: 'tooltip' });
																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
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
										}
									});
								} else {
									$$renderer.push('<!--[-1-->');

									ProjectAccessSelector($$renderer, {
										get projectAccess() {
											return projectAccess;
										},

										set projectAccess($$value) {
											projectAccess = $$value;
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
							Button($$renderer, {
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								submissionLoader: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Update`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { showEdit });
	});
}