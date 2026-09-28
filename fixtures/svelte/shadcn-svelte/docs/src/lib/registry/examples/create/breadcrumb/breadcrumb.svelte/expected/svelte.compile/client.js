import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BreadcrumbBasic from "./breadcrumb-basic.svelte";
import BreadcrumbWithDropdown from "./breadcrumb-with-dropdown.svelte";
import BreadcrumbWithLink from "./breadcrumb-with-link.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Breadcrumb($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			BreadcrumbBasic(node, {});

			var node_1 = $.sibling(node, 2);

			BreadcrumbWithDropdown(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			BreadcrumbWithLink(node_2, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}