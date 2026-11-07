import * as $ from 'svelte/internal/server';
import Logo from './logo.svelte';
import { LightSwitch } from './ui/light-switch';
import LayoutToggle from './layout-toggle.svelte';
import { Separator } from './ui/separator';
import MobileSheet from './mobile-sheet.svelte';
import { GitHubButton, getStars } from './ui/github-button';
import { onMount } from 'svelte';

function HeaderLink($$renderer, { href, name }) {
	$$renderer.push(`<a${$.attr('href', href)} class="hover:bg-secondary flex h-7 items-center justify-center rounded-md px-2.5 text-sm transition-all">${$.escape(name)}</a>`);
}

export default function Site_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const STARS_FALLBACK = 525;
		let stars = STARS_FALLBACK;
		const repo = { owner: 'ieedan', repo: 'shadcn-svelte-extras' };

		onMount(async () => {
			stars = await getStars({ ...repo, fallback: STARS_FALLBACK });
		});

		$$renderer.push(`<header class="bg-background sticky top-0 z-10 flex flex-col items-center"><div class="site-container flex h-(--header-height) w-full items-center justify-between">`);
		MobileSheet($$renderer, {});
		$$renderer.push(`<!----> <div class="hidden items-center md:flex"><a href="/">`);
		Logo($$renderer, { class: 'mr-2 size-6' });
		$$renderer.push(`<!----></a> `);
		HeaderLink($$renderer, { href: '/docs', name: 'Docs' });
		$$renderer.push(`<!----> `);
		HeaderLink($$renderer, { href: '/components', name: 'Components' });
		$$renderer.push(`<!----> `);
		HeaderLink($$renderer, { href: '/hooks', name: 'Hooks' });
		$$renderer.push(`<!----> `);
		HeaderLink($$renderer, { href: '/actions', name: 'Actions' });
		$$renderer.push(`<!----></div> <div class="flex items-center gap-2 **:data-[slot=separator]:h-4!">`);
		GitHubButton($$renderer, { variant: 'ghost', size: 'sm', repo, stars });
		$$renderer.push(`<!----> `);
		Separator($$renderer, { orientation: 'vertical' });
		$$renderer.push(`<!----> `);
		LayoutToggle($$renderer, { class: 'hidden xl:flex' });
		$$renderer.push(`<!----> `);
		Separator($$renderer, { orientation: 'vertical', class: 'hidden xl:block' });
		$$renderer.push(`<!----> `);
		LightSwitch($$renderer, { variant: 'ghost', size: 'sm' });
		$$renderer.push(`<!----></div></div></header>`);
	});
}