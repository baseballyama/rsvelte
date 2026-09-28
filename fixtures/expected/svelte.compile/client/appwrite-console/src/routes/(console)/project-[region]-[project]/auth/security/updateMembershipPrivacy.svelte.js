import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Selector } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function UpdateMembershipPrivacy($$anchor, $$props) {
	$.push($$props, true);

	let authMembershipsMfa = $.state($.proxy($$props.policy.userMFA));
	let authMembershipsUserId = $.state($.proxy($$props.policy.userId));
	let authMembershipsUserName = $.state($.proxy($$props.policy.userName));
	let authMembershipsUserEmail = $.state($.proxy($$props.policy.userEmail));
	let authMembershipsUserPhone = $.state($.proxy($$props.policy.userPhone));
	const isSubmitDisabled = $.derived(() => $.get(authMembershipsUserId) === $$props.policy.userId && $.get(authMembershipsUserName) === $$props.policy.userName && $.get(authMembershipsUserEmail) === $$props.policy.userEmail && $.get(authMembershipsUserPhone) === $$props.policy.userPhone && $.get(authMembershipsMfa) === $$props.policy.userMFA);

	async function updateMembershipsPrivacy() {
		try {
			await sdk.forProject($$props.project.region, $$props.project.$id).project.updateMembershipPrivacyPolicy({
				userId: $.get(authMembershipsUserId),
				userName: $.get(authMembershipsUserName),
				userEmail: $.get(authMembershipsUserEmail),
				userPhone: $.get(authMembershipsUserPhone),
				userMFA: $.get(authMembershipsMfa)
			});

			await invalidate(Dependencies.PROJECT);
			addNotification({ type: 'success', message: 'Updated memberships privacy' });
			trackEvent(Submit.AuthMembershipPrivacyUpdate);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.AuthMembershipPrivacyUpdate);
		}
	}

	Form($$anchor, {
		onSubmit: updateMembershipsPrivacy,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Set privacy preferences to manage which details team members can view about one another.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Memberships privacy');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						$.component(node, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
							Selector_Checkbox($$anchor, {
								id: 'membershipsUserId',
								label: 'User ID',
								description: 'Display team members\' user IDs to other team members',
								get checked() {
									return $.get(authMembershipsUserId);
								},

								set checked($$value) {
									$.set(authMembershipsUserId, $$value, true);
								}
							});
						});

						var node_1 = $.sibling(node, 2);

						$.component(node_1, () => Selector.Checkbox, ($$anchor, Selector_Checkbox_1) => {
							Selector_Checkbox_1($$anchor, {
								id: 'membershipsUserName',
								label: 'Name',
								description: 'Display team members\' names to other team members',
								get checked() {
									return $.get(authMembershipsUserName);
								},

								set checked($$value) {
									$.set(authMembershipsUserName, $$value, true);
								}
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Selector.Checkbox, ($$anchor, Selector_Checkbox_2) => {
							Selector_Checkbox_2($$anchor, {
								id: 'membershipsUserEmail',
								label: 'Email',
								description: 'Allow team members to view each other\'s email addresses',
								get checked() {
									return $.get(authMembershipsUserEmail);
								},

								set checked($$value) {
									$.set(authMembershipsUserEmail, $$value, true);
								}
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Selector.Checkbox, ($$anchor, Selector_Checkbox_3) => {
							Selector_Checkbox_3($$anchor, {
								id: 'membershipsUserPhone',
								label: 'Phone',
								description: 'Allow team members to view each other\'s phone numbers',
								get checked() {
									return $.get(authMembershipsUserPhone);
								},

								set checked($$value) {
									$.set(authMembershipsUserPhone, $$value, true);
								}
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Selector.Checkbox, ($$anchor, Selector_Checkbox_4) => {
							Selector_Checkbox_4($$anchor, {
								id: 'membershipsMfa',
								label: 'MFA status',
								description: 'Show if team members have multi-factor authentication enabled',
								get checked() {
									return $.get(authMembershipsMfa);
								},

								set checked($$value) {
									$.set(authMembershipsMfa, $$value, true);
								}
							});
						});

						$.append($$anchor, fragment_2);
					},

					actions: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							get disabled() {
								return $.get(isSubmitDisabled);
							},
							submit: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Update');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}