import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AvatarGroupExample from "./avatar-group-example.svelte";
import AvatarGroupWithCount from "./avatar-group-with-count.svelte";
import AvatarGroupWithIconCount from "./avatar-group-with-icon-count.svelte";
import AvatarInEmpty from "./avatar-in-empty.svelte";
import AvatarSizes from "./avatar-sizes.svelte";
import AvatarWithBadgeIcon from "./avatar-with-badge-icon.svelte";
import AvatarWithBadge from "./avatar-with-badge.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Avatar($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AvatarSizes(node, {});

			var node_1 = $.sibling(node, 2);

			AvatarWithBadge(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			AvatarWithBadgeIcon(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			AvatarGroupExample(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			AvatarGroupWithCount(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			AvatarGroupWithIconCount(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			AvatarInEmpty(node_6, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}