import * as $ from 'svelte/internal/server';
import NativeSelectBasic from "./native-select-basic.svelte";
import NativeSelectDisabled from "./native-select-disabled.svelte";
import NativeSelectInvalid from "./native-select-invalid.svelte";
import NativeSelectSizes from "./native-select-sizes.svelte";
import NativeSelectWithField from "./native-select-with-field.svelte";
import NativeSelectWithGroups from "./native-select-with-groups.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Native_select($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			NativeSelectBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			NativeSelectWithGroups($$renderer, {});
			$$renderer.push(`<!----> `);
			NativeSelectSizes($$renderer, {});
			$$renderer.push(`<!----> `);
			NativeSelectWithField($$renderer, {});
			$$renderer.push(`<!----> `);
			NativeSelectDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			NativeSelectInvalid($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}