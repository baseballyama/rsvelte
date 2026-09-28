import * as $ from 'svelte/internal/server';
import CollapsibleFileTree from "./collapsible-file-tree.svelte";
import CollapsibleSettings from "./collapsible-settings.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Collapsible($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			CollapsibleFileTree($$renderer, {});
			$$renderer.push(`<!----> `);
			CollapsibleSettings($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}