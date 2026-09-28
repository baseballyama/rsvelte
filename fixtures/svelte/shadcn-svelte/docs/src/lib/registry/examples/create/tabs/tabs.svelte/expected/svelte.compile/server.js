import * as $ from 'svelte/internal/server';
import TabsBasic from "./tabs-basic.svelte";
import TabsDisabled from "./tabs-disabled.svelte";
import TabsIconOnly from "./tabs-icon-only.svelte";
import TabsLineDisabled from "./tabs-line-disabled.svelte";
import TabsLineWithContent from "./tabs-line-with-content.svelte";
import TabsLine from "./tabs-line.svelte";
import TabsMultiple from "./tabs-multiple.svelte";
import TabsVariantsComparison from "./tabs-variants-comparison.svelte";
import TabsVertical from "./tabs-vertical.svelte";
import TabsWithContent from "./tabs-with-content.svelte";
import TabsWithDropdown from "./tabs-with-dropdown.svelte";
import TabsWithIcons from "./tabs-with-icons.svelte";
import TabsWithInputAndButton from "./tabs-with-input-and-button.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Tabs($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			TabsBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsLine($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsVariantsComparison($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsIconOnly($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsMultiple($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsWithContent($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsLineWithContent($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsLineDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsWithDropdown($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsVertical($$renderer, {});
			$$renderer.push(`<!----> `);
			TabsWithInputAndButton($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}