import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Container } from '$lib/layout';
import UpdatePassword from './updatePassword.svelte';
import UpdateName from './updateName.svelte';
import UpdateEmail from './updateEmail.svelte';
import DeleteAccount from './deleteAccount.svelte';
import UpdateMfa from './updateMfa.svelte';
import Identities from './identities.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			UpdateName(node, {});

			var node_1 = $.sibling(node, 2);

			UpdateEmail(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			UpdatePassword(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			Identities(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			UpdateMfa(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			DeleteAccount(node_5, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}