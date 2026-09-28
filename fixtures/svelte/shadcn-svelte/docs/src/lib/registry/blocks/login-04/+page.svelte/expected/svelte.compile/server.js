import * as $ from 'svelte/internal/server';
import LoginForm from "./components/login-form.svelte";

export default function _page($$renderer) {
	$$renderer.push(`<div class="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10"><div class="w-full max-w-sm md:max-w-3xl">`);
	LoginForm($$renderer, {});
	$$renderer.push(`<!----></div></div>`);
}