import * as $ from 'svelte/internal/server';
import FieldCheckboxFields from "./field-checkbox-fields.svelte";
import FieldHorizontalFields from "./field-horizontal-fields.svelte";
import FieldInputFields from "./field-input-fields.svelte";
import FieldInputOTPFields from "./field-input-otp-fields.svelte";
import FieldNativeSelectFields from "./field-native-select-fields.svelte";
import FieldRadioFields from "./field-radio-fields.svelte";
import FieldSelectFields from "./field-select-fields.svelte";
import FieldSliderFields from "./field-slider-fields.svelte";
import FieldSwitchFields from "./field-switch-fields.svelte";
import FieldTextareaFields from "./field-textarea-fields.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Field($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			FieldInputFields($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldTextareaFields($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldSelectFields($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldCheckboxFields($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldRadioFields($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldSwitchFields($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldSliderFields($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldNativeSelectFields($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldInputOTPFields($$renderer, {});
			$$renderer.push(`<!----> `);
			FieldHorizontalFields($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}