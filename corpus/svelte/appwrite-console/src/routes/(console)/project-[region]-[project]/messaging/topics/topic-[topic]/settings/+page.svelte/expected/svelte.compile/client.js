import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Container } from '$lib/layout';
import DangerZone from './dangerZone.svelte';
import Details from './details.svelte';
import UpdateName from './updateName.svelte';
import UpdatePermissions from './updatePermissions.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Details(node, {});

			var node_1 = $.sibling(node, 2);

			UpdateName(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			UpdatePermissions(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			DangerZone(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}