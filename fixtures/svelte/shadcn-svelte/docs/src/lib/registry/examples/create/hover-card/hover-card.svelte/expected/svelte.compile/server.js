import * as $ from 'svelte/internal/server';
import HoverCardInDialog from "./hover-card-in-dialog.svelte";
import HoverCardSides from "./hover-card-sides.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Hover_card($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			HoverCardSides($$renderer, {});
			$$renderer.push(`<!----> `);
			HoverCardInDialog($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}