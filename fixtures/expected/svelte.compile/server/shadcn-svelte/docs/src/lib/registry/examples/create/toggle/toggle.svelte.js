import * as $ from 'svelte/internal/server';
import ToggleBasic from "./toggle-basic.svelte";
import ToggleDisabled from "./toggle-disabled.svelte";
import ToggleOutline from "./toggle-outline.svelte";
import ToggleSizes from "./toggle-sizes.svelte";
import ToggleWithButtonIconText from "./toggle-with-button-icon-text.svelte";
import ToggleWithButtonIcon from "./toggle-with-button-icon.svelte";
import ToggleWithButtonText from "./toggle-with-button-text.svelte";
import ToggleWithIcon from "./toggle-with-icon.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Toggle($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ToggleBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleOutline($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleSizes($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleWithButtonText($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleWithButtonIcon($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleWithButtonIconText($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleWithIcon($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}