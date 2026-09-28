import * as $ from 'svelte/internal/server';
import NavigationMenuWithViewport from "./navigation-menu-with-viewport.svelte";
import NavigationMenuWithoutViewport from "./navigation-menu-without-viewport.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Navigation_menu($$renderer) {
	ExampleWrapper($$renderer, {
		class: 'lg:grid-cols-1',
		children: ($$renderer) => {
			NavigationMenuWithViewport($$renderer, {});
			$$renderer.push(`<!----> `);
			NavigationMenuWithoutViewport($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}