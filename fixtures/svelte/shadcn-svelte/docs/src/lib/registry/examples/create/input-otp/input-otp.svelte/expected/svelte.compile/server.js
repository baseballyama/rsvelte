import * as $ from 'svelte/internal/server';
import InputOTPAlphanumeric from "./input-otp-alphanumeric.svelte";
import InputOTPDisabled from "./input-otp-disabled.svelte";
import InputOTPForm from "./input-otp-form.svelte";
import InputOTPFourDigits from "./input-otp-four-digits.svelte";
import InputOTPInvalid from "./input-otp-invalid.svelte";
import InputOTPPattern from "./input-otp-pattern.svelte";
import InputOTPSimple from "./input-otp-simple.svelte";
import InputOTPWithSeparator from "./input-otp-with-separator.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Input_otp($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			InputOTPForm($$renderer, {});
			$$renderer.push(`<!----> `);
			InputOTPSimple($$renderer, {});
			$$renderer.push(`<!----> `);
			InputOTPPattern($$renderer, {});
			$$renderer.push(`<!----> `);
			InputOTPWithSeparator($$renderer, {});
			$$renderer.push(`<!----> `);
			InputOTPAlphanumeric($$renderer, {});
			$$renderer.push(`<!----> `);
			InputOTPDisabled($$renderer, {});
			$$renderer.push(`<!----> `);
			InputOTPFourDigits($$renderer, {});
			$$renderer.push(`<!----> `);
			InputOTPInvalid($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}