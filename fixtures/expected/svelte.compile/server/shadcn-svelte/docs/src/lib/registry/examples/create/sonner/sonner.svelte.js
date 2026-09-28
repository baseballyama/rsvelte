import * as $ from 'svelte/internal/server';
import SonnerBasic from "./sonner-basic.svelte";
import SonnerWithDescription from "./sonner-with-description.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Sonner($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			SonnerBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			SonnerWithDescription($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}