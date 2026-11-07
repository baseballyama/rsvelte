import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import readme from '../../README.md?raw';
import { marked } from 'marked';
import { baseUrl } from 'marked-base-url';
import { base } from '$app/paths';
import { gfmHeadingId } from 'marked-gfm-heading-id';

var root = $.from_html(`<div id="readme" class="docs-page markdown-body svelte-1uha8ag"></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);
	marked.use(baseUrl(base));
	marked.use(gfmHeadingId());

	const readmeHtml = marked.parse(readme.// eslint-disable-next-line no-misleading-character-class
	replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, '').replace(/.\/static\//g, './'));

	var div = root();

	$.head('1uha8ag', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'svelte-tiny-virtual-list';
		});
	});

	$.html(div, () => readmeHtml, true);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}