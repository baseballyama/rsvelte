import * as $ from 'svelte/internal/server';
import ButtonGroupBasic from "./button-group-basic.svelte";
import ButtonGroupNavigation from "./button-group-navigation.svelte";
import ButtonGroupNested from "./button-group-nested.svelte";
import ButtonGroupPaginationSplit from "./button-group-pagination-split.svelte";
import ButtonGroupPagination from "./button-group-pagination.svelte";
import ButtonGroupTextAlignment from "./button-group-text-alignment.svelte";
import ButtonGroupVerticalNested from "./button-group-vertical-nested.svelte";
import ButtonGroupVertical from "./button-group-vertical.svelte";
import ButtonGroupWithDropdown from "./button-group-with-dropdown.svelte";
import ButtonGroupWithFields from "./button-group-with-fields.svelte";
import ButtonGroupWithIcons from "./button-group-with-icons.svelte";
import ButtonGroupWithInputGroup from "./button-group-with-input-group.svelte";
import ButtonGroupWithInput from "./button-group-with-input.svelte";
import ButtonGroupWithLike from "./button-group-with-like.svelte";
import ButtonGroupWithSelectAndInput from "./button-group-with-select-and-input.svelte";
import ButtonGroupWithSelect from "./button-group-with-select.svelte";
import ButtonGroupWithText from "./button-group-with-text.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Button_group($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ButtonGroupBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupWithInput($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupWithText($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupWithDropdown($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupWithSelect($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupWithInputGroup($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupWithFields($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupWithLike($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupWithSelectAndInput($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupNested($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupPagination($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupPaginationSplit($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupNavigation($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupTextAlignment($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupVertical($$renderer, {});
			$$renderer.push(`<!----> `);
			ButtonGroupVerticalNested($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}