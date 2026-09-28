import * as $ from 'svelte/internal/server';
import ToggleGroupBasic from "./toggle-group-basic.svelte";
import ToggleGroupDateRange from "./toggle-group-date-range.svelte";
import ToggleGroupFilter from "./toggle-group-filter.svelte";
import ToggleGroupFontWeightSelector from "./toggle-group-font-weight-selector.svelte";
import ToggleGroupOutlineWithIcons from "./toggle-group-outline-with-icons.svelte";
import ToggleGroupOutline from "./toggle-group-outline.svelte";
import ToggleGroupSizes from "./toggle-group-sizes.svelte";
import ToggleGroupSort from "./toggle-group-sort.svelte";
import ToggleGroupSpacing from "./toggle-group-spacing.svelte";
import ToggleGroupVerticalOutlineWithIcons from "./toggle-group-vertical-outline-with-icons.svelte";
import ToggleGroupVerticalOutline from "./toggle-group-vertical-outline.svelte";
import ToggleGroupVerticalWithSpacing from "./toggle-group-vertical-with-spacing.svelte";
import ToggleGroupVertical from "./toggle-group-vertical.svelte";
import ToggleGroupWithIcons from "./toggle-group-with-icons.svelte";
import ToggleGroupWithInputAndSelect from "./toggle-group-with-input-and-select.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Toggle_group($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ToggleGroupBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupOutline($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupOutlineWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupSizes($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupSpacing($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupFilter($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupDateRange($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupSort($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupWithInputAndSelect($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupVertical($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupVerticalOutline($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupVerticalOutlineWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupVerticalWithSpacing($$renderer, {});
			$$renderer.push(`<!----> `);
			ToggleGroupFontWeightSelector($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}