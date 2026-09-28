import * as $ from 'svelte/internal/server';
import SeparatorHorizontal from "./separator-horizontal.svelte";
import SeparatorInList from "./separator-in-list.svelte";
import SeparatorVerticalMenu from "./separator-vertical-menu.svelte";
import SeparatorVertical from "./separator-vertical.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Separator($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			SeparatorHorizontal($$renderer, {});
			$$renderer.push(`<!----> `);
			SeparatorVertical($$renderer, {});
			$$renderer.push(`<!----> `);
			SeparatorVerticalMenu($$renderer, {});
			$$renderer.push(`<!----> `);
			SeparatorInList($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}