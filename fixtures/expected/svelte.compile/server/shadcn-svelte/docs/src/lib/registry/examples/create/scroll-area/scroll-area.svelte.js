import * as $ from 'svelte/internal/server';
import ScrollAreaHorizontal from "./scroll-area-horizontal.svelte";
import ScrollAreaVertical from "./scroll-area-vertical.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Scroll_area($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ScrollAreaVertical($$renderer, {});
			$$renderer.push(`<!----> `);
			ScrollAreaHorizontal($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}