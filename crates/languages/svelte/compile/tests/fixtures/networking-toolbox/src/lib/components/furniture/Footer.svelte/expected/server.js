import * as $ from 'svelte/internal/server';
import { footerLinks } from '$lib/constants/nav';
import { site, author, license } from '$lib/constants/site';

export default function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<footer class="footer svelte-7dtyhk"><p class="footer-sub svelte-7dtyhk"><a${$.attr('href', site.url)} target="_blank" rel="noopener noreferrer" class="svelte-7dtyhk">${$.escape(site.title)}</a> is licensed under <a${$.attr('href', license.url)} target="_blank" rel="noopener noreferrer" class="svelte-7dtyhk">${$.escape(license.name)}</a>, (C) <a${$.attr('href', author.githubUrl)} target="_blank" rel="noopener noreferrer" class="svelte-7dtyhk">${$.escape(author.name)}</a> ${$.escape(license.date)}</p> <p class="footer-sub svelte-7dtyhk"><!--[-->`);

		const each_array = $.ensure_array_like(footerLinks);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			$$renderer.push(`<a${$.attr('href', item.href)} class="svelte-7dtyhk">${$.escape(item.label)}</a>${$.escape(i < footerLinks.length - 1 ? ' • ' : '')}`);
		}

		$$renderer.push(`<!--]--></p></footer>`);
	});
}