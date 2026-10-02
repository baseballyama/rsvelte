import * as $ from 'svelte/internal/server';
import SpinnerBasic from "./spinner-basic.svelte";
import SpinnerInBadges from "./spinner-in-badges.svelte";
import SpinnerInButtons from "./spinner-in-buttons.svelte";
import SpinnerInEmpty from "./spinner-in-empty.svelte";
import SpinnerInInputGroup from "./spinner-in-input-group.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Spinner($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			SpinnerBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			SpinnerInButtons($$renderer, {});
			$$renderer.push(`<!----> `);
			SpinnerInBadges($$renderer, {});
			$$renderer.push(`<!----> `);
			SpinnerInInputGroup($$renderer, {});
			$$renderer.push(`<!----> `);
			SpinnerInEmpty($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}