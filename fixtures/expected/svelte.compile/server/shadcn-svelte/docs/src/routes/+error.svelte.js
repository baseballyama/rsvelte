import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { ModeWatcher } from "mode-watcher";

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ModeWatcher($$renderer, {});
		$$renderer.push(`<!----> <h1>${$.escape(page.status)}</h1> <p>${$.escape(page.error?.message)}</p>`);
	});
}