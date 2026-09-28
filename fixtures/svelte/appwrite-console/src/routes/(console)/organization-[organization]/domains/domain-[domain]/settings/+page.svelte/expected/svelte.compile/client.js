import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Container } from '$lib/layout';
import DeleteDomain from './deleteDomain.svelte';
import ChangeOrganization from './changeOrganization.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ChangeOrganization(node, {
				get domain() {
					return $$props.data.domain;
				},

				get organizations() {
					return $$props.data.organizations;
				}
			});

			var node_1 = $.sibling(node, 2);

			DeleteDomain(node_1, {
				get domain() {
					return $$props.data.domain;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}