import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Modal } from '$lib/components';
import { InputText, InputEmail, Button, InputRadio } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { organization, currentPlan } from '$lib/stores/organization';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { isCloud, isSelfHosted } from '$lib/system';
import { roles, buildProjectRole } from '$lib/stores/billing';
import InputSelect from '$lib/elements/forms/inputSelect.svelte';
import Roles from '$lib/components/roles/roles.svelte';
import { Icon, Popover, Layout } from '@appwrite.io/pink-svelte';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import ProjectAccessSelector from './projectAccessSelector.svelte';

export default function CreateMember($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { showCreate = false, oncreated } = $$props;
		const supportsProjectRoles = $.derived(() => isCloud && !!$.store_get($$store_subs ??= {}, '$currentPlan', currentPlan)?.supportsProjectSpecificRoles);
		let email = '';
		let name = '';
		let error = null;
		let role = isSelfHosted ? 'owner' : 'developer';
		let accessType = 'all';
		let projectAccess = [];

		function buildRoles() {
			if (isCloud && accessType === 'specific') {
				return projectAccess.filter((a) => a.projectId && a.roleName).map((a) => buildProjectRole(a.projectId, a.roleName));
			}

			return [role];
		}

		async function create() {
			const memberRoles = buildRoles();

			if (isCloud && accessType === 'specific' && memberRoles.length === 0) {
				error = 'Add at least one project to grant access.';

				return;
			}

			try {
				const team = await sdk.forConsole.teams.createMembership({
					teamId: $.store_get($$store_subs ??= {}, '$organization', organization).$id,
					roles: memberRoles,
					email,
					url: `${page.url.origin}${base}/invite`,
					name: name || undefined
				});

				await Promise.all([
					invalidate(Dependencies.ACCOUNT),
					invalidate(Dependencies.ORGANIZATION),
					invalidate(Dependencies.MEMBERS)
				]);

				showCreate = false;
				addNotification({ type: 'success', message: `Invite has been sent to ${email}` });
				trackEvent(Submit.MemberCreate);
				oncreated?.(team);
			} catch(e) {
				error = e.message;
				trackError(e, Submit.MemberCreate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Invite member',
				error,
				onSubmit: create,
				get show() {
					return showCreate;
				},

				set show($$value) {
					showCreate = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					InputEmail($$renderer, {
						required: true,
						id: 'email',
						label: 'Email',
						placeholder: 'Enter email',
						autofocus: true,
						get value() {
							return email;
						},

						set value($$value) {
							email = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					InputText($$renderer, {
						id: 'member-name',
						label: 'Name',
						placeholder: 'Enter name',
						get value() {
							return name;
						},

						set value($$value) {
							name = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					if (isCloud) {
						$$renderer.push('<!--[0-->');

						if (supportsProjectRoles()) {
							$$renderer.push('<!--[0-->');

							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									gap: 's',
									children: ($$renderer) => {
										InputRadio($$renderer, {
											id: 'access-all',
											name: 'invite-access-type',
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
											id: 'access-specific',
											name: 'invite-access-type',
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
								required: true,
								id: 'role',
								label: 'Role',
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
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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
									$$renderer.push(`<!---->Send invite`);
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

		$.bind_props($$props, { showCreate });
	});
}