import * as $ from 'svelte/internal/server';
import Icon from '$/lib/Icon.svelte';
import Logo from '$/lib/Logo.svelte';
import NewsletterForm from '$/lib/newsletter/NewsletterForm.svelte';
import PodcastLinks from '$/lib/PodcastLinks.svelte';
import '../../(site)/style.css';

export default function _page($$renderer) {
	const POD_DATA = {
		name: 'Syntax',
		twitter: 'syntaxfm',
		instagram: 'syntax_fm',
		tiktok: 'syntaxfm',
		linkedin_company: 'syntaxfm',
		threads: 'syntax_fm',
		github: 'syntaxfm'
	};

	$$renderer.push(`<div class="theme-wrapper theme-light"><div class="logo svelte-18y08rk"><a href="/" class="svelte-18y08rk">`);
	Logo($$renderer, {});
	$$renderer.push(`<!----></a></div> <main class="page-layout layout zone"${$.attr_style('', { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' })}><section><h3 class="h4 lines" style="margin: 2rem 0;">Subscribe to the podcast</h3> `);
	PodcastLinks($$renderer, {});
	$$renderer.push(`<!----> <br/> <h3 class="h4 lines">Links</h3> <div class="links svelte-18y08rk"><a${$.attr('href', `https://x.com/${POD_DATA.twitter}`)} target="_blank" class="button subscribe subscribe--x svelte-18y08rk">`);
	Icon($$renderer, { name: 'x', title: `${POD_DATA.name} on X` });
	$$renderer.push(`<!----></a> <a${$.attr('href', `https://github.com/${POD_DATA.github}`)} target="_blank" class="button subscribe subscribe--github svelte-18y08rk">`);
	Icon($$renderer, { name: 'github', title: `${POD_DATA.name} on GitHub` });
	$$renderer.push(`<!----></a> <a${$.attr('href', `https://www.instagram.com/${POD_DATA.instagram}/`)} target="_blank" class="button subscribe subscribe--instagram svelte-18y08rk">`);
	Icon($$renderer, { name: 'instagram', title: `${POD_DATA.name} on Instagram` });
	$$renderer.push(`<!----></a> <a${$.attr('href', `https://www.tiktok.com/@${POD_DATA.tiktok}`)} target="_blank" class="button subscribe subscribe--tiktok svelte-18y08rk">`);
	Icon($$renderer, { name: 'tiktok', title: `${POD_DATA.name} on TikTok` });
	$$renderer.push(`<!----></a> <a${$.attr('href', `https://www.linkedin.com/company/${POD_DATA.linkedin_company}/`)} target="_blank" class="button subscribe subscribe--linkedin svelte-18y08rk">`);
	Icon($$renderer, { name: 'linkedin', title: `${POD_DATA.name} on LinkedIn` });
	$$renderer.push(`<!----></a> <a${$.attr('href', `https://www.threads.net/@${POD_DATA.threads}`)} target="_blank" class="button subscribe subscribe--threads svelte-18y08rk">`);
	Icon($$renderer, { name: 'threads', title: `${POD_DATA.name} on Threads` });
	$$renderer.push(`<!----></a></div></section> <div class="zone layout full"${$.attr_style('', { '--bg': 'var(--black)', '--fg': 'var(--white)' })}><div>`);
	NewsletterForm($$renderer, { show_logo: false });
	$$renderer.push(`<!----></div></div></main></div>`);
}