import * as $ from 'svelte/internal/server';
import "../app.css";
import { navigating } from "$app/stores";
import { expoOut } from "svelte/easing";
import { slide } from "svelte/transition";

export default function _layout($$renderer, $$props) {
	var $$store_subs;
	let { children } = $$props;

	if ($.store_get($$store_subs ??= {}, '$navigating', navigating)) {
		$$renderer.push(`<!--[0--><div class="fixed w-full top-0 right-0 left-0 h-1 z-50 bg-primary"></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);
	children?.($$renderer);
	$$renderer.push(`<!---->`);

	if ($$store_subs) $.unsubscribe_stores($$store_subs);
}