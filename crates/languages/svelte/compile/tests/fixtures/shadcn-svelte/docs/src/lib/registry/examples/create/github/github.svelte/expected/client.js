import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AssignIssue from "./assign-issue.svelte";
import CodespacesCard from "./codespaces-card.svelte";
import ContributionsActivity from "./contributions-activity.svelte";
import Contributors from "./contributors.svelte";
import Navbar from "./navbar.svelte";
import Profile from "./profile.svelte";
import RepositoryToolbar from "./repository-toolbar.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Github($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CodespacesCard(node, {});

			var node_1 = $.sibling(node, 2);

			AssignIssue(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Navbar(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			RepositoryToolbar(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			Profile(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			ContributionsActivity(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			Contributors(node_6, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}