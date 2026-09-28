import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EmptyBasic from "./empty-basic.svelte";
import EmptyInCard from "./empty-in-card.svelte";
import EmptyWithBorder from "./empty-with-border.svelte";
import EmptyWithIcon from "./empty-with-icon.svelte";
import EmptyWithMutedBackgroundAlt from "./empty-with-muted-background-alt.svelte";
import EmptyWithMutedBackground from "./empty-with-muted-background.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Empty($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			EmptyBasic(node, {});

			var node_1 = $.sibling(node, 2);

			EmptyWithMutedBackground(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			EmptyWithBorder(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			EmptyWithIcon(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			EmptyWithMutedBackgroundAlt(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			EmptyInCard(node_5, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}