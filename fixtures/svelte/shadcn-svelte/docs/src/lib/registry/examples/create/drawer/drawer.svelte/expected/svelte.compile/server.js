import * as $ from 'svelte/internal/server';
import DrawerScrollableContent from "./drawer-scrollable-content.svelte";
import DrawerWithSides from "./drawer-with-sides.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Drawer($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			DrawerScrollableContent($$renderer, {});
			$$renderer.push(`<!----> `);
			DrawerWithSides($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}