import * as $ from 'svelte/internal/server';
import CheckboxBasic from "./checkbox-basic.svelte";
import CheckboxDisabled from "./checkbox-disabled.svelte";
import CheckboxGroup from "./checkbox-group.svelte";
import CheckboxInTable from "./checkbox-in-table.svelte";
import CheckboxInvalid from "./checkbox-invalid.svelte";
import CheckboxWithDescription from "./checkbox-with-description.svelte";
import CheckboxWithTitle from "./checkbox-with-title.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Checkbox($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			CheckboxBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			CheckboxWithDescription($$renderer, {});
			$$renderer.push(`<!----> `);
			CheckboxInvalid($$renderer, {});
			$$renderer.push(`<!----> `);
			CheckboxDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			CheckboxWithTitle($$renderer, {});
			$$renderer.push(`<!----> `);
			CheckboxInTable($$renderer, {});
			$$renderer.push(`<!----> `);
			CheckboxGroup($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}