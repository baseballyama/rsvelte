import * as $ from 'svelte/internal/server';
import siteConfig from 'virtual:sveltepress/site';
import themeOptions from 'virtual:sveltepress/theme-default';
import NavItem from './NavItem.svelte';
import { getPathFromBase, parseImageSrc } from './utils';

export default function Logo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		NavItem($$renderer, {
			to: getPathFromBase('/'),
			title: siteConfig.title,
			brand: true,
			children: ($$renderer) => {
				if (themeOptions.logo) {
					$$renderer.push(`<!--[0--><img class="logo svelte-jpembn" height="32"${$.attr('src', parseImageSrc(themeOptions.logo))}${$.attr('alt', siteConfig.title)}/> <span class="title svelte-jpembn">${$.escape(siteConfig.title)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}