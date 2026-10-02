import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InputOTPAlphanumeric from "./input-otp-alphanumeric.svelte";
import InputOTPDisabled from "./input-otp-disabled.svelte";
import InputOTPForm from "./input-otp-form.svelte";
import InputOTPFourDigits from "./input-otp-four-digits.svelte";
import InputOTPInvalid from "./input-otp-invalid.svelte";
import InputOTPPattern from "./input-otp-pattern.svelte";
import InputOTPSimple from "./input-otp-simple.svelte";
import InputOTPWithSeparator from "./input-otp-with-separator.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input_otp($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			InputOTPForm(node, {});

			var node_1 = $.sibling(node, 2);

			InputOTPSimple(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			InputOTPPattern(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			InputOTPWithSeparator(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			InputOTPAlphanumeric(node_4, {});

			var node_5 = $.sibling(node_4, 2);

			InputOTPDisabled(node_5, {});

			var node_6 = $.sibling(node_5, 2);

			InputOTPFourDigits(node_6, {});

			var node_7 = $.sibling(node_6, 2);

			InputOTPInvalid(node_7, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}