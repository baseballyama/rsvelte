import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { base } from '$app/paths';
import TableOfContents from '$lib/components/TableOfContents.svelte';

export default function DocPage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title = '', description = '', children } = $$props;
		let articleEl = null;

		const editUrl = $.derived(() => () => {
			const pathname = page.url.pathname.replace(base, '') || '/';

			return `https://github.com/SauravKanchan/svelte-chartjs/edit/master/sites/docs/src/routes${pathname}/+page.md`;
		});

		$.head('1wur4sp', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(title ? `${title} | svelte-chartjs` : 'svelte-chartjs')}</title>`);
			});

			if (description) {
				$$renderer.push(`<!--[0--><meta name="description"${$.attr('content', description)}/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<div class="doc-layout svelte-1wur4sp"><article class="svelte-1wur4sp">`);
		children($$renderer);
		$$renderer.push(`<!----> <footer class="edit-link svelte-1wur4sp"><a${$.attr('href', editUrl()())} target="_blank" rel="noopener noreferrer" class="svelte-1wur4sp">Edit this page on GitHub</a></footer></article> `);

		if (articleEl) {
			$$renderer.push('<!--[0-->');
			TableOfContents($$renderer, { article: articleEl });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}