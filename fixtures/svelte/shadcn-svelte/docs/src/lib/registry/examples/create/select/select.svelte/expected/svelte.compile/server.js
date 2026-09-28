import * as $ from 'svelte/internal/server';
import SelectBasic from "./select-basic.svelte";
import SelectDisabled from "./select-disabled.svelte";
import SelectInDialog from "./select-in-dialog.svelte";
import SelectInline from "./select-inline.svelte";
import SelectInvalid from "./select-invalid.svelte";
import SelectItemAligned from "./select-item-aligned.svelte";
import SelectLargeList from "./select-large-list.svelte";
import SelectPlan from "./select-plan.svelte";
import SelectSizes from "./select-sizes.svelte";
import SelectWithButton from "./select-with-button.svelte";
import SelectWithField from "./select-with-field.svelte";
import SelectWithGroups from "./select-with-groups.svelte";
import SelectWithIcons from "./select-with-icons.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Select($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			SelectBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectWithGroups($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectLargeList($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectSizes($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectPlan($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectWithButton($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectItemAligned($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectWithField($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectInvalid($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectInline($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			SelectInDialog($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}