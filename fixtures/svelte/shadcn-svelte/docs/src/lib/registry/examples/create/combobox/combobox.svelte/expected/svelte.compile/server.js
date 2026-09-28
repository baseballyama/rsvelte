import * as $ from 'svelte/internal/server';
import ComboboxBasic from "./combobox-basic.svelte";
import ComboboxDisabledItems from "./combobox-disabled-items.svelte";
import ComboboxDisabled from "./combobox-disabled.svelte";
import ComboboxInDialog from "./combobox-in-dialog.svelte";
import ComboboxInPopup from "./combobox-in-popup.svelte";
import ComboboxInvalid from "./combobox-invalid.svelte";
import ComboboxLargeList from "./combobox-large-list.svelte";
import ComboboxMultipleInvalid from "./combobox-multiple-invalid.svelte";
import ComboboxMultiple from "./combobox-multiple.svelte";
import ComboboxWithCustomItems from "./combobox-with-custom-items.svelte";
import ComboboxWithForm from "./combobox-with-form.svelte";
import ComboboxWithGroupsAndSeparator from "./combobox-with-groups-and-separator.svelte";
import ComboboxWithGroups from "./combobox-with-groups.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Combobox($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ComboboxBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxInvalid($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxWithGroups($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxWithGroupsAndSeparator($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxLargeList($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxInPopup($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxWithForm($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxMultiple($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxMultipleInvalid($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxWithCustomItems($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxInDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			ComboboxDisabledItems($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}