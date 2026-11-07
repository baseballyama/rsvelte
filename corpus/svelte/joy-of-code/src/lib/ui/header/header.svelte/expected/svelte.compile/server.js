import * as $ from 'svelte/internal/server';
import Logo from './logo.svelte';
import Search from './search';
import Socials from './socials.svelte';
import Preferences from './preferences/index.svelte';
import Menu from './menu.svelte';
import * as config from '$lib/site/config';

export default function Header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let scrollY = 0;
		let scrolled = $.derived(() => scrollY > 0);

		$$renderer.push(`<header${$.attr_class('svelte-1zwcjd', void 0, { 'scrolled': scrolled() })}><div class="container svelte-1zwcjd"><div class="logo svelte-1zwcjd">`);
		Logo($$renderer, {});
		$$renderer.push(`<!----> <a href="/" class="svelte-1zwcjd">${$.escape(config.siteName)}</a></div> `);
		Search($$renderer, {});
		$$renderer.push(`<!----> `);
		Socials($$renderer, {});
		$$renderer.push(`<!----> <nav class="svelte-1zwcjd">`);
		Preferences($$renderer, {});
		$$renderer.push(`<!----> `);
		Menu($$renderer, {});
		$$renderer.push(`<!----></nav></div></header>`);
	});
}