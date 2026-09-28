import * as $ from 'svelte/internal/server';
import "../app.css";
import { page } from "$app/stores";

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		$$renderer.push(`<div class="hero min-h-[100vh]"><div class="hero-content text-center"><div class="max-w-lg"><h1 class="text-5xl font-bold">This is embarrassing...</h1> <p class="py-6 text-2xl">There was an error: ${$.escape($.store_get($$store_subs ??= {}, '$page', page)?.error?.message)}</p> <div><a href="/" class="btn btn-primary btn-wide">Return Home</a></div></div></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}