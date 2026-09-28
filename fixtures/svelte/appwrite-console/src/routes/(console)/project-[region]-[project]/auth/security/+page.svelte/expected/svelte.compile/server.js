import * as $ from 'svelte/internal/server';
import { Container } from '$lib/layout';
import UpdateMockNumbers from './updateMockNumbers.svelte';
import UpdateMembershipPrivacy from './updateMembershipPrivacy.svelte';
import UpdateUsersLimit from './updateUsersLimit.svelte';
import UpdateSessionLength from './updateSessionLength.svelte';
import UpdateSessionsLimit from './updateSessionsLimit.svelte';
import PasswordPolicies from './passwordPolicies.svelte';
import PasswordStrengthPolicy from './passwordStrengthPolicy.svelte';
import UpdateMfaFactors from './updateMfaFactors.svelte';
import SessionSecurity from './sessionSecurity.svelte';
import UpdateSignupEmailSecurity from './updateSignupEmailSecurity.svelte';
import { isCloud } from '$lib/system';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		Container($$renderer, {
			children: ($$renderer) => {
				UpdateUsersLimit($$renderer, { project: data.project, policy: data.userLimitPolicy });
				$$renderer.push(`<!----> `);
				UpdateSessionLength($$renderer, { project: data.project, policy: data.sessionDurationPolicy });
				$$renderer.push(`<!----> `);
				UpdateSessionsLimit($$renderer, { project: data.project, policy: data.sessionLimitPolicy });
				$$renderer.push(`<!----> `);
				PasswordStrengthPolicy($$renderer, { project: data.project, policy: data.passwordStrengthPolicy });
				$$renderer.push(`<!----> `);

				PasswordPolicies($$renderer, {
					project: data.project,
					dictionaryPolicy: data.passwordDictionaryPolicy,
					historyPolicy: data.passwordHistoryPolicy,
					personalDataPolicy: data.passwordPersonalDataPolicy
				});

				$$renderer.push(`<!----> `);

				if (data.mfaFactorsPolicy) {
					$$renderer.push('<!--[0-->');
					UpdateMfaFactors($$renderer, { project: data.project, policy: data.mfaFactorsPolicy });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (isCloud) {
					$$renderer.push('<!--[0-->');

					UpdateSignupEmailSecurity($$renderer, {
						project: data.project,
						denyAliasedEmailPolicy: data.denyAliasedEmailPolicy,
						denyDisposableEmailPolicy: data.denyDisposableEmailPolicy,
						denyFreeEmailPolicy: data.denyFreeEmailPolicy,
						denyCorporateEmailPolicy: data.denyCorporateEmailPolicy
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				SessionSecurity($$renderer, {
					project: data.project,
					sessionAlertPolicy: data.sessionAlertPolicy,
					sessionInvalidationPolicy: data.sessionInvalidationPolicy
				});

				$$renderer.push(`<!----> `);
				UpdateMockNumbers($$renderer, { project: data.project });
				$$renderer.push(`<!----> `);
				UpdateMembershipPrivacy($$renderer, { project: data.project, policy: data.membershipPrivacyPolicy });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}