import * as $ from 'svelte/internal/server';
import CommandBasic from "./command-basic.svelte";
import CommandInline from "./command-inline.svelte";
import CommandManyItems from "./command-many-items.svelte";
import CommandWithGroups from "./command-with-groups.svelte";
import CommandWithShortcuts from "./command-with-shortcuts.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Command($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			CommandInline($$renderer, {});
			$$renderer.push(`<!----> `);
			CommandBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			CommandWithShortcuts($$renderer, {});
			$$renderer.push(`<!----> `);
			CommandWithGroups($$renderer, {});
			$$renderer.push(`<!----> `);
			CommandManyItems($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}