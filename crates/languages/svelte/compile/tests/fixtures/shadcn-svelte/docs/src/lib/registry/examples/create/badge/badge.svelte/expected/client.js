import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BadgeAsLink from "./badge-as-link.svelte";
import BadgeCustomColors from "./badge-custom-colors.svelte";
import BadgeLongText from "./badge-long-text.svelte";
import BadgeVariants from "./badge-variants.svelte";
import BadgeWithIconLeft from "./badge-with-icon-left.svelte";
import BadgeWithIconRight from "./badge-with-icon-right.svelte";
import BadgeWithSpinner from "./badge-with-spinner.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Badge($$anchor) {
	ExampleWrapper($$anchor, {
		class: 'lg:grid-cols-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			BadgeVariants(node, {});

			var node_1 = $.sibling(node, 2);

			BadgeWithIconLeft(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			BadgeWithIconRight(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			BadgeWithSpinner(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			BadgeAsLink(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			BadgeLongText(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			BadgeCustomColors(node_6, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}