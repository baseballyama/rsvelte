import * as $ from 'svelte/internal/server';
import { Container } from '$lib/layout';
import UpdatePassword from './updatePassword.svelte';
import UpdateName from './updateName.svelte';
import UpdateEmail from './updateEmail.svelte';
import DeleteAccount from './deleteAccount.svelte';
import UpdateMfa from './updateMfa.svelte';
import Identities from './identities.svelte';

export default function _page($$renderer) {
	Container($$renderer, {
		children: ($$renderer) => {
			UpdateName($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdateEmail($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdatePassword($$renderer, {});
			$$renderer.push(`<!----> `);
			Identities($$renderer, {});
			$$renderer.push(`<!----> `);
			UpdateMfa($$renderer, {});
			$$renderer.push(`<!----> `);
			DeleteAccount($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}