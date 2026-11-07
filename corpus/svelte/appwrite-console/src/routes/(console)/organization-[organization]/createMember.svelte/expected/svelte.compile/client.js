import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function CreateMember($$anchor, $$props) {
	$.push($$props, true);

	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];
	let showCreate = $.prop($$props, 'showCreate', 15, false);
	const supportsProjectRoles = $.derived(() => isCloud && !!$currentPlan()?.supportsProjectSpecificRoles);
	let email = $.state('');
	let name = $.state('');
	let error = $.state(null);
	let role = $.state($.proxy(isSelfHosted ? 'owner' : 'developer'));
	let accessType = $.state('all');
	let projectAccess = $.state($.proxy([]));

	$.user_effect(() => {
		if (!showCreate()) {
			$.set(error, null);
			$.set(email, '');
			$.set(name, '');
			$.set(role, isSelfHosted ? 'owner' : 'developer', true);
			$.set(accessType, 'all');
			$.set(projectAccess, [], true);
		}
	});

	function buildRoles() {
		if (isCloud && $.get(accessType) === 'specific') {
			return $.get(projectAccess).filter((a) => a.projectId && a.roleName).map((a) => buildProjectRole(a.projectId, a.roleName));
		}

		return [$.get(role)];
	}

	async function create() {
		const memberRoles = buildRoles();

		if (isCloud && $.get(accessType) === 'specific' && memberRoles.length === 0) {
			$.set(error, 'Add at least one project to grant access.');

			return;
		}

		try {
			const team = await sdk.forConsole.teams.createMembership({
				teamId: $organization().$id,
				roles: memberRoles,
				email: $.get(email),
				url: `${page.url.origin}${base}/invite`,
				name: $.get(name) || undefined
			});

			await Promise.all([
				invalidate(Dependencies.ACCOUNT),
				invalidate(Dependencies.ORGANIZATION),
				invalidate(Dependencies.MEMBERS)
			]);

			showCreate(false);

			addNotification({
				type: 'success',
				message: `Invite has been sent to ${$.get(email)}`
			});

			trackEvent(Submit.MemberCreate);
			$$props.oncreated?.(team);
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.MemberCreate);
		}
	}

	Modal($$anchor, {
		title: 'Invite member',
		get error() {
			return $.get(error);
		},
		onSubmit: create,
		get show() {
			return showCreate();
		},

		set show($$value) {
			showCreate($$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			InputEmail(node, {
				required: true,
				id: 'email',
				label: 'Email',
				placeholder: 'Enter email',
				autofocus: true,
				get value() {
					return $.get(email);
				},

				set value($$value) {
					$.set(email, $$value, true);
				}
			});

			var node_1 = $.sibling(node, 2);

			InputText(node_1, {
				id: 'member-name',
				label: 'Name',
				placeholder: 'Enter name',
				get value() {
					return $.get(name);
				},

				set value($$value) {
					$.set(name, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									direction: 'row',
									gap: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_5 = $.first_child(fragment_4);

										InputRadio(node_5, {
											id: 'access-all',
											name: 'invite-access-type',
											label: 'All projects',
											value: 'all',
											get group() {
												return $.get(accessType);
											},

											set group($$value) {
												$.set(accessType, $$value, true);
											}
										});

										var node_6 = $.sibling(node_5, 2);

										InputRadio(node_6, {
											id: 'access-specific',
											name: 'invite-access-type',
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

						$.if(node_3, ($$render) => {
							if ($.get(supportsProjectRoles)) $$render(consequent);
						});
					}

					var node_7 = $.sibling(node_3, 2);

					{
						var consequent_1 = ($$anchor) => {
							InputSelect($$anchor, {
								required: true,
								id: 'role',
								label: 'Role',
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
										var node_8 = $.first_child(fragment_6);

										$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
											Layout_Stack_1($$anchor, {
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
																var node_9 = $.first_child(fragment_10);

																$.component(node_9, () => Roles, ($$anchor, $$component) => {
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

						$.if(node_7, ($$render) => {
							if ($.get(accessType) === 'all' || !$.get(supportsProjectRoles)) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.if(node_2, ($$render) => {
					if (isCloud) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_12 = root();
				var node_10 = $.first_child(fragment_12);

				Button(node_10, {
					secondary: true,
					$$events: { click: () => showCreate(false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Cancel');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_11 = $.sibling(node_10, 2);

				Button(node_11, {
					submit: true,
					submissionLoader: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Send invite');

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