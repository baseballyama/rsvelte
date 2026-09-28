import * as $ from 'svelte/internal/server';
import { navigating } from '$app/state';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<nav><a href="/state/navigating/a">a</a> <a href="/state/navigating/b">b</a> <a href="/state/navigating/c">c</a></nav> <div id="nav-status">`);

		if (navigating.to) {
			$$renderer.push(`<!--[0--><p id="navigating">navigating from ${$.escape(navigating.from?.url.pathname)} to ${$.escape(navigating.to.url.pathname)} (${$.escape(navigating.type)})</p>`);
		} else {
			$$renderer.push(`<!--[-1--><p id="not-navigating">not currently navigating</p>`);
		}

		$$renderer.push(`<!--]--></div> <!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]-->`);
	});
}