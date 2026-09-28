import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			InputBasic(node, {});

			var node_1 = $.sibling(node, 2);

			InputInvalid(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			InputWithLabel(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			InputWithDescription(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			InputDisabled(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			InputTypes(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			InputWithSelect(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			InputWithButton(node_7, {});

			var node_8 = $.sibling(node_7, 2);

			InputWithNativeSelect(node_8, {});

			var node_9 = $.sibling(node_8, 2);

			InputForm(node_9, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}