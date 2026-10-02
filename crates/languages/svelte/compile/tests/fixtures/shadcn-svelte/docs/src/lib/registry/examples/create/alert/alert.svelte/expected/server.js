import * as $ from 'svelte/internal/server';
import AlertBasic from "./alert-basic.svelte";
import AlertDestructive from "./alert-destructive.svelte";
import AlertWithActions from "./alert-with-actions.svelte";
import AlertWithIcons from "./alert-with-icons.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Alert($$renderer) {
	ExampleWrapper($$renderer, {
		class: 'lg:grid-cols-1',
		children: ($$renderer) => {
			AlertBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			AlertWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			AlertDestructive($$renderer, {});
			$$renderer.push(`<!----> `);
			AlertWithActions($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}