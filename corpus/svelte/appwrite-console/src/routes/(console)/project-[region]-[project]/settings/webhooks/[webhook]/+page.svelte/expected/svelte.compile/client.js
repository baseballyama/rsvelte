import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Container } from '$lib/layout';
import DangerZone from './dangerZone.svelte';
import UpdateEvents from './updateEvents.svelte';
import UpdateName from './updateName.svelte';
import UpdateSecurity from './updateSecurity.svelte';
import UpdateSignature from './updateSignature.svelte';
import UpdateUrl from './updateURL.svelte';
import Details from './details.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Details(node, {});

			var node_1 = $.sibling(node, 2);

			UpdateSignature(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			UpdateName(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			UpdateUrl(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			UpdateEvents(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			UpdateSecurity(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			DangerZone(node_6, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}