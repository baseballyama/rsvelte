import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Field($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			FieldInputFields(node, {});

			var node_1 = $.sibling(node, 2);

			FieldTextareaFields(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			FieldSelectFields(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			FieldCheckboxFields(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			FieldRadioFields(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			FieldSwitchFields(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			FieldSliderFields(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			FieldNativeSelectFields(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			FieldInputOTPFields(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			FieldHorizontalFields(node_9, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}