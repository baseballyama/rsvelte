import * as $ from 'svelte/internal/server';
import InputBasic from "./input-basic.svelte";
import InputDisabled from "./input-disabled.svelte";
import InputForm from "./input-form.svelte";
import InputInvalid from "./input-invalid.svelte";
import InputTypes from "./input-types.svelte";
import InputWithButton from "./input-with-button.svelte";
import InputWithDescription from "./input-with-description.svelte";
import InputWithLabel from "./input-with-label.svelte";
import InputWithNativeSelect from "./input-with-native-select.svelte";
import InputWithSelect from "./input-with-select.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Input($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			InputBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			InputInvalid($$renderer, {});
			$$renderer.push(`<!----> `);
			InputWithLabel($$renderer, {});
			$$renderer.push(`<!----> `);
			InputWithDescription($$renderer, {});
			$$renderer.push(`<!----> `);
			InputDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			InputTypes($$renderer, {});
			$$renderer.push(`<!----> `);
			InputWithSelect($$renderer, {});
			$$renderer.push(`<!----> `);
			InputWithButton($$renderer, {});
			$$renderer.push(`<!----> `);
			InputWithNativeSelect($$renderer, {});
			$$renderer.push(`<!----> `);
			InputForm($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}