import * as $ from 'svelte/internal/server';
import AssignIssue from "./assign-issue.svelte";
import CodespacesCard from "./codespaces-card.svelte";
import ContributionsActivity from "./contributions-activity.svelte";
import Contributors from "./contributors.svelte";
import Navbar from "./navbar.svelte";
import Profile from "./profile.svelte";
import RepositoryToolbar from "./repository-toolbar.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Github($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			CodespacesCard($$renderer, {});
			$$renderer.push(`<!----> `);
			AssignIssue($$renderer, {});
			$$renderer.push(`<!----> `);
			Navbar($$renderer, {});
			$$renderer.push(`<!----> `);
			RepositoryToolbar($$renderer, {});
			$$renderer.push(`<!----> `);
			Profile($$renderer, {});
			$$renderer.push(`<!----> `);
			ContributionsActivity($$renderer, {});
			$$renderer.push(`<!----> `);
			Contributors($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}