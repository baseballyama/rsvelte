import * as $ from 'svelte/internal/server';
import SwitchBasic from "./switch-basic.svelte";
import SwitchDisabled from "./switch-disabled.svelte";
import SwitchSizes from "./switch-sizes.svelte";
import SwitchWithDescription from "./switch-with-description.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Switch($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			SwitchBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			SwitchWithDescription($$renderer, {});
			$$renderer.push(`<!----> `);
			SwitchDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			SwitchSizes($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}