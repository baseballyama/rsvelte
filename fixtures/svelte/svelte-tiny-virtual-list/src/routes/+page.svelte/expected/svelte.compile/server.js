import * as $ from 'svelte/internal/server';
import readme from '../../README.md?raw';
import { marked } from 'marked';
import { baseUrl } from 'marked-base-url';
import { base } from '$app/paths';
import { gfmHeadingId } from 'marked-gfm-heading-id';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		marked.use(baseUrl(base));
		marked.use(gfmHeadingId());

		const readmeHtml = marked.parse(readme.// eslint-disable-next-line no-misleading-character-class
		replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '').replace(/.\/static\//g, './'));

		$.head('1uha8ag', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>svelte-tiny-virtual-list</title>`);
			});
		});

		$$renderer.push(`<div id="readme" class="docs-page markdown-body svelte-1uha8ag">${$.html(readmeHtml)}</div>`);
	});
}