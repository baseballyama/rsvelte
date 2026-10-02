import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Selector } from '@appwrite.io/pink-svelte';

export default function UpdateMembershipPrivacy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { project, policy } = $$props;
		let authMembershipsMfa = policy.userMFA;
		let authMembershipsUserId = policy.userId;
		let authMembershipsUserName = policy.userName;
		let authMembershipsUserEmail = policy.userEmail;
		let authMembershipsUserPhone = policy.userPhone;
		const isSubmitDisabled = $.derived(() => authMembershipsUserId === policy.userId && authMembershipsUserName === policy.userName && authMembershipsUserEmail === policy.userEmail && authMembershipsUserPhone === policy.userPhone && authMembershipsMfa === policy.userMFA);

		async function updateMembershipsPrivacy() {
			try {
				await sdk.forProject(project.region, project.$id).project.updateMembershipPrivacyPolicy({
					userId: authMembershipsUserId,
					userName: authMembershipsUserName,
					userEmail: authMembershipsUserEmail,
					userPhone: authMembershipsUserPhone,
					userMFA: authMembershipsMfa
				});

				await invalidate(Dependencies.PROJECT);
				addNotification({ type: 'success', message: 'Updated memberships privacy' });
				trackEvent(Submit.AuthMembershipPrivacyUpdate);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.AuthMembershipPrivacyUpdate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateMembershipsPrivacy,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Set privacy preferences to manage which details team members can view about one another.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Memberships privacy`);
								}
							},

							aside: ($$renderer) => {
								{
									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'membershipsUserId',
											label: 'User ID',
											description: 'Display team members\' user IDs to other team members',
											get checked() {
												return authMembershipsUserId;
											},

											set checked($$value) {
												authMembershipsUserId = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'membershipsUserName',
											label: 'Name',
											description: 'Display team members\' names to other team members',
											get checked() {
												return authMembershipsUserName;
											},

											set checked($$value) {
												authMembershipsUserName = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'membershipsUserEmail',
											label: 'Email',
											description: 'Allow team members to view each other\'s email addresses',
											get checked() {
												return authMembershipsUserEmail;
											},

											set checked($$value) {
												authMembershipsUserEmail = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'membershipsUserPhone',
											label: 'Phone',
											description: 'Allow team members to view each other\'s phone numbers',
											get checked() {
												return authMembershipsUserPhone;
											},

											set checked($$value) {
												authMembershipsUserPhone = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Selector.Checkbox) {
										$$renderer.push('<!--[-->');

										Selector.Checkbox($$renderer, {
											id: 'membershipsMfa',
											label: 'MFA status',
											description: 'Show if team members have multi-factor authentication enabled',
											get checked() {
												return authMembershipsMfa;
											},

											set checked($$value) {
												authMembershipsMfa = $$value;
												$$settled = false;
											}
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: isSubmitDisabled(),
										submit: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}