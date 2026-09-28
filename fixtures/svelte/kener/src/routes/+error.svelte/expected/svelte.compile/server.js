import * as $ from 'svelte/internal/server';
import { page } from "$app/state";

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// This boundary renders when a route group's layout load fails (e.g. the
		// database is unreachable), so it must not depend on app CSS or any server
		// data — everything here is self-contained.
		const isServerFailure = $.derived(() => page.status >= 500);

		$.head('1j96wlh', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(page.status)} — ${$.escape(isServerFailure()
					? "Status page temporarily unavailable"
					: "Something went wrong")}</title>`);
			});

			if (isServerFailure()) {
				$$renderer.push(`<!--[0--><meta http-equiv="refresh" content="30"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<div class="error-wrap svelte-1j96wlh"><div class="error-card svelte-1j96wlh">`);

		if (isServerFailure()) {
			$$renderer.push(`<!--[0--><h1 class="svelte-1j96wlh">This status page is temporarily unavailable</h1> <p class="svelte-1j96wlh">We are having trouble serving this page right now. It usually resolves on its own.</p> <p class="svelte-1j96wlh">This page will retry automatically in 30 seconds.</p>`);
		} else {
			$$renderer.push(`<!--[-1--><h1 class="svelte-1j96wlh">Something went wrong</h1> <p class="svelte-1j96wlh">${$.escape(page.error?.message || "The page you requested could not be loaded.")}</p>`);
		}

		$$renderer.push(`<!--]--> <div class="error-code svelte-1j96wlh">${$.escape(page.status)}</div></div></div>`);
	});
}