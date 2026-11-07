import * as $ from 'svelte/internal/server';
import SnsBar from './SnsBar.svelte';
import { page } from '$app/stores';
import { resolve } from '$app/paths';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function isActive(pathname, path) {
			const normalizedPathname = pathname.replace(/\/$/u, '');
			const normalizedPath = path.replace(/\/$/u, '');

			return normalizedPathname === normalizedPath || normalizedPathname === resolve(normalizedPath || '/');
		}

		$$renderer.push(`<header class="header svelte-10tpybp"><span class="title svelte-10tpybp">svelte-eslint-parser</span> <a${$.attr_class('menu svelte-10tpybp', void 0, {
			'active': isActive($.store_get($$store_subs ??= {}, '$page', page).url.pathname, `/`)
		})}${$.attr('href', resolve('/'))}>AST</a> <a${$.attr_class('menu svelte-10tpybp', void 0, {
			'active': isActive($.store_get($$store_subs ??= {}, '$page', page).url.pathname, `/playground`)
		})}${$.attr('href', resolve('/playground'))}>Playgroud</a> <a${$.attr_class('menu svelte-10tpybp', void 0, {
			'active': isActive($.store_get($$store_subs ??= {}, '$page', page).url.pathname, `/scope`)
		})}${$.attr('href', resolve('/scope'))}>Scope</a> <a${$.attr_class('menu svelte-10tpybp', void 0, {
			'active': isActive($.store_get($$store_subs ??= {}, '$page', page).url.pathname, `/virtual-script-code`)
		})}${$.attr('href', resolve('/virtual-script-code'))}>Virtual Script Code</a> <div class="debug svelte-10tpybp">$page.url.pathname: ${$.escape($.store_get($$store_subs ??= {}, '$page', page).url.pathname)}</div> `);

		SnsBar($$renderer, {});
		$$renderer.push(`<!----> <a href="https://github.com/sveltejs/svelte-eslint-parser" class="github-link svelte-10tpybp">View on GitHub</a></header>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}