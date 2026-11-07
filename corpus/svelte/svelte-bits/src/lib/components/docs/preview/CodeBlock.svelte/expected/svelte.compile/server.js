import * as $ from 'svelte/internal/server';
import { highlighter, resolveDocsCodeLang } from './code-block-shiki';
import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';

export default function CodeBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code, language = 'svelte' } = $$props;
		let hlCore = null;

		highlighter.then((h) => {
			hlCore = h;
		});

		const trimmedCode = $.derived(() => code.trimEnd());
		const resolvedLang = $.derived(() => resolveDocsCodeLang(language));

		const html = $.derived(() => {
			const hl = hlCore;
			const c = trimmedCode();
			const lang = resolvedLang();

			if (!hl) return '';

			return hl.codeToHtml(c, { lang, theme: 'svelte-bits' }) ?? '';
		});

		const clipboard = new UseClipboard();

		$$renderer.push(`<div class="code-highlighter"${$.attr('data-language', language)}><button class="code-copy-button" type="button" aria-label="Copy code">`);

		if (clipboard.copied) {
			$$renderer.push(`<!--[0--><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`);
		} else {
			$$renderer.push(`<!--[-1--><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`);
		}

		$$renderer.push(`<!--]--></button> `);

		if (html()) {
			$$renderer.push(`<!--[0-->${$.html(html())}`);
		} else {
			$$renderer.push(`<!--[-1--><pre class="code-fallback">${$.escape(code)}</pre>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}