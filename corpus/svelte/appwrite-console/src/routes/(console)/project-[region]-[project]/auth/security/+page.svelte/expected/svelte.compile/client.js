import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			UpdateUsersLimit(node, {
				get project() {
					return $$props.data.project;
				},

				get policy() {
					return $$props.data.userLimitPolicy;
				}
			});

			var node_1 = $.sibling(node, 2);

			UpdateSessionLength(node_1, {
				get project() {
					return $$props.data.project;
				},

				get policy() {
					return $$props.data.sessionDurationPolicy;
				}
			});

			var node_2 = $.sibling(node_1, 2);

			UpdateSessionsLimit(node_2, {
				get project() {
					return $$props.data.project;
				},

				get policy() {
					return $$props.data.sessionLimitPolicy;
				}
			});

			var node_3 = $.sibling(node_2, 2);

			PasswordStrengthPolicy(node_3, {
				get project() {
					return $$props.data.project;
				},

				get policy() {
					return $$props.data.passwordStrengthPolicy;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			PasswordPolicies(node_4, {
				get project() {
					return $$props.data.project;
				},

				get dictionaryPolicy() {
					return $$props.data.passwordDictionaryPolicy;
				},

				get historyPolicy() {
					return $$props.data.passwordHistoryPolicy;
				},

				get personalDataPolicy() {
					return $$props.data.passwordPersonalDataPolicy;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent = ($$anchor) => {
					UpdateMfaFactors($$anchor, {
						get project() {
							return $$props.data.project;
						},

						get policy() {
							return $$props.data.mfaFactorsPolicy;
						}
					});
				};

				$.if(node_5, ($$render) => {
					if ($$props.data.mfaFactorsPolicy) $$render(consequent);
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_1 = ($$anchor) => {
					UpdateSignupEmailSecurity($$anchor, {
						get project() {
							return $$props.data.project;
						},

						get denyAliasedEmailPolicy() {
							return $$props.data.denyAliasedEmailPolicy;
						},

						get denyDisposableEmailPolicy() {
							return $$props.data.denyDisposableEmailPolicy;
						},

						get denyFreeEmailPolicy() {
							return $$props.data.denyFreeEmailPolicy;
						},

						get denyCorporateEmailPolicy() {
							return $$props.data.denyCorporateEmailPolicy;
						}
					});
				};

				$.if(node_6, ($$render) => {
					if (isCloud) $$render(consequent_1);
				});
			}

			var node_7 = $.sibling(node_6, 2);

			SessionSecurity(node_7, {
				get project() {
					return $$props.data.project;
				},

				get sessionAlertPolicy() {
					return $$props.data.sessionAlertPolicy;
				},

				get sessionInvalidationPolicy() {
					return $$props.data.sessionInvalidationPolicy;
				}
			});

			var node_8 = $.sibling(node_7, 2);

			UpdateMockNumbers(node_8, {
				get project() {
					return $$props.data.project;
				}
			});

			var node_9 = $.sibling(node_8, 2);

			UpdateMembershipPrivacy(node_9, {
				get project() {
					return $$props.data.project;
				},

				get policy() {
					return $$props.data.membershipPrivacyPolicy;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}