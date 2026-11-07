import * as $ from 'svelte/internal/server';
import LoginForm from "./components/login-form.svelte";

export default function _page($$renderer) {
	$$renderer.push(`<div class="flex h-screen w-full items-center justify-center px-4">`);
	LoginForm($$renderer, {});
	$$renderer.push(`<!----></div>`);
}