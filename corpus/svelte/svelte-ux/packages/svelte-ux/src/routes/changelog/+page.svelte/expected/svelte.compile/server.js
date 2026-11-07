import * as $ from 'svelte/internal/server';
import { marked } from 'marked';
import { TableOfContents } from 'svelte-ux';
import changelog from '../../../CHANGELOG.md?raw';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function sanitize(str) {
			return str.replace(/</g, '\\<').replace(/>/g, '\\>');
		}

		$$renderer.push(`<div class="grid grid-cols-[1fr,auto] gap-6 pt-2 pb-4"><div class="bg-surface-100 p-2 m-2 rounded shadow-lg border overflow-auto"><div class="prose px-4">${$.html(marked.parse(sanitize(changelog)))}</div></div> <div class="hidden lg:block w-[224px]"><div class="sticky top-[var(--headerHeight)] pr-2 max-h-[calc(100vh-64px)] overflow-auto"><div class="text-xs uppercase leading-8 tracking-widest text-surface-content/50">On this page</div> `);
		TableOfContents($$renderer, { maxDepth: 2 });
		$$renderer.push(`<!----></div></div></div>`);
	});
}