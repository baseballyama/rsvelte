import * as $ from 'svelte/internal/server';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github.css';
import copy from 'copy-to-clipboard';

export default function CodeBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		hljs.registerLanguage('javascript', javascript);
		hljs.registerLanguage('xml', xml);

		let codeElement;

		function escapeHtml(value) {
			return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
		}

		let {
			autodetect = true,
			language = '',
			setLanguage = () => {},
			ignoreIllegals = true,
			code,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let copying = 0;
		let highlightedCode = '';
		const cannotDetectLanguage = $.derived(() => !autodetect && !hljs.getLanguage(language));
		const className = $.derived(() => cannotDetectLanguage() ? '' : `hljs ${language} ${restProps.class ?? ''}`);

		// eslint-disable-next-line svelte/no-dom-manipulating
		function onCopy() {
			if (!code) return;

			copy(code);
			copying++;

			setTimeout(
				() => {
					copying--;
				},
				2000
			);
		}

		$$renderer.push(`<div class="outerWrapper svelte-ipr7k2"><button class="copyButton svelte-ipr7k2" aria-label="Copy code">`);

		if (copying) {
			$$renderer.push(`<!--[0--><div class="svelte-ipr7k2"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M20 6L9 17l-5-5"></path></svg></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="svelte-ipr7k2"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision"><path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path></svg></div>`);
		}

		$$renderer.push(`<!--]--></button> <div class="wrapper svelte-ipr7k2"><div${$.attr_class(`${className()} root`, 'svelte-ipr7k2')}><code></code></div></div></div>`);
	});
}