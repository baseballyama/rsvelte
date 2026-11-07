import * as $ from 'svelte/internal/server';
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import SignupForm from "./components/signup-form.svelte";

export default function _page($$renderer) {
	$$renderer.push(`<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10"><div class="flex w-full max-w-sm flex-col gap-6"><a href="#/" class="flex items-center gap-2 self-center font-medium"><div class="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">`);
	GalleryVerticalEndIcon($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----></div> Acme Inc.</a> `);
	SignupForm($$renderer, {});
	$$renderer.push(`<!----></div></div>`);
}