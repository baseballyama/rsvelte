import * as $ from 'svelte/internal/server';
import OTPForm from "./components/otp-form.svelte";

export default function _page($$renderer) {
	$$renderer.push(`<div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10"><div class="w-full max-w-sm md:max-w-3xl">`);
	OTPForm($$renderer, {});
	$$renderer.push(`<!----></div></div>`);
}