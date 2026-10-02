import * as $ from 'svelte/internal/server';
import { formatDate } from '$lib/utils';
import * as config from '$lib/site/config';
import Card from './card.svelte';
import Clipboard from './clipboard.svelte';
import TableOfContents from './toc.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let editUrl = $.derived(() => `${config.fileUrl}/${data.frontmatter.slug}/${data.frontmatter.slug}.md`);
		let image = $.derived(() => `${config.postImage}${encodeURIComponent(data.frontmatter.title)}.png`);

		$.head('jot9ci', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(data.frontmatter.title)}</title>`);
			});

			$$renderer.push(`<meta${$.attr('content', data.frontmatter.description)} name="description"/> <meta${$.attr('content', data.frontmatter.title)} property="og:title"/> <meta${$.attr('content', image())} property="og:image"/> <meta${$.attr('content', config.siteUrl)} property="og:url"/> <meta${$.attr('content', data.frontmatter.description)} property="og:description"/> <meta${$.attr('content', config.siteName)} property="og:site_name"/> <meta${$.attr('content', config.twitterHandle)} name="twitter:creator"/> <meta content="summary_large_image" name="twitter:card"/> <meta${$.attr('content', data.frontmatter.title)} name="twitter:title"/> <meta${$.attr('content', data.frontmatter.description)} name="twitter:description"/> <meta${$.attr('content', image())} name="twitter:image"/>`);
		});

		Clipboard($$renderer, {});
		$$renderer.push(`<!----> <main>`);
		TableOfContents($$renderer, {});
		$$renderer.push(`<!----> <article class="prose"><header><h1 class="title svelte-jot9ci"${$.attr_style('', { 'view-transition-name': data.frontmatter.slug })}>${$.escape(data.frontmatter.title)}</h1> <p class="published svelte-jot9ci">Published ${$.escape(formatDate(data.frontmatter.published))}</p></header> `);

		if (data.component) {
			$$renderer.push('<!--[-->');
			data.component($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</article> <div class="cards svelte-jot9ci">`);
		Card($$renderer, { preset: 'support' });
		$$renderer.push(`<!----> `);
		Card($$renderer, { preset: 'edit', editUrl: editUrl() });
		$$renderer.push(`<!----></div></main>`);
	});
}