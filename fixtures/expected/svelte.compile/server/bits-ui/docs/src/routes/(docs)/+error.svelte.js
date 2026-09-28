import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { buttonVariants } from "$lib/styles/buttonVariants.js";

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const message = $.derived(() => page.status === 404 ? "Not Found" : "Something went wrong");

		$$renderer.push(`<section class="flex h-[calc(100vh_-_71px_-_8rem)] flex-col items-center justify-center gap-3"><h1 class="text-foreground text-6xl font-bold tracking-wider">${$.escape(page.status)}</h1> <p class="text-foreground">${$.escape(message())}</p> <a href="/docs"${$.attr_class($.clsx(buttonVariants({ size: "lg" })))}>Back to docs</a></section>`);
	});
}