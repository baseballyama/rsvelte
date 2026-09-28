import * as $ from 'svelte/internal/server';
import OTPForm from "./components/otp-form.svelte";

export default function _page($$renderer) {
	$$renderer.push(`<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10"><div class="w-full max-w-sm">`);
	OTPForm($$renderer, {});
	$$renderer.push(`<!----></div></div>`);
}