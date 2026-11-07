import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SkeletonAvatar from "./skeleton-avatar.svelte";
import SkeletonCard from "./skeleton-card.svelte";
import SkeletonForm from "./skeleton-form.svelte";
import SkeletonTable from "./skeleton-table.svelte";
import SkeletonText from "./skeleton-text.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Skeleton($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SkeletonAvatar(node, {});

			var node_1 = $.sibling(node, 2);

			SkeletonCard(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			SkeletonText(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			SkeletonForm(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			SkeletonTable(node_4, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}