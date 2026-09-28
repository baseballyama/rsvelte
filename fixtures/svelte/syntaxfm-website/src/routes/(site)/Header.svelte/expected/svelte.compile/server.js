import * as $ from 'svelte/internal/server';
import Logo from '$lib/Logo.svelte';
import Search from '$lib/search/Search.svelte';
import MobileNav from './MobileNav.svelte';
import { page } from '$app/stores';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { transparent = false } = $$props;

		$$renderer.push(`<header${$.attr_class('layout full svelte-se6v6o', void 0, { 'transparent': transparent })}${$.attr_style('', { '--fg': 'var(--fg-1)' })}><div class="header-container content svelte-se6v6o"><div class="logo svelte-se6v6o">`);

		if ($.store_get($$store_subs ??= {}, '$page', page).url.pathname !== '/') {
			$$renderer.push(`<!--[0--><a title="Syntax Podcast Home" href="/">`);
			Logo($$renderer, {});
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <nav class="desktop_nav content svelte-se6v6o"><a${$.attr_class($.clsx($.store_get($$store_subs ??= {}, '$page', page).url.pathname.startsWith('/shows') ? 'active' : ''), 'svelte-se6v6o')} href="/shows">Shows</a> <a${$.attr_class($.clsx($.store_get($$store_subs ??= {}, '$page', page).url.pathname.startsWith('/videos') ? 'active' : ''), 'svelte-se6v6o')} href="/videos">Video</a> <a${$.attr_class($.clsx($.store_get($$store_subs ??= {}, '$page', page).url.pathname.startsWith('/snackpack') ? 'active' : ''), 'svelte-se6v6o')} href="/snackpack">Newsletter</a> <a${$.attr_class($.clsx($.store_get($$store_subs ??= {}, '$page', page).url.pathname.startsWith('/about') ? 'active' : ''), 'svelte-se6v6o')} href="/about">About</a> <a${$.attr_class($.clsx($.store_get($$store_subs ??= {}, '$page', page).url.pathname.startsWith('/potluck') ? 'active' : ''), 'svelte-se6v6o')} href="/potluck">Potluck Qs</a> <a target="_blank" href="https://sentry.shop" class="svelte-se6v6o">Swag</a> `);
		Search($$renderer, {});
		$$renderer.push(`<!----> `);
		MobileNav($$renderer, {});
		$$renderer.push(`<!----></nav></div></header>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}