import * as $ from 'svelte/internal/server';
import 'highlight.js/styles/github-dark.css';
import { cn } from '$site/utils.js';
import hljs from 'highlight.js';
import hljsSvelte from 'highlightjs-svelte/dist/index.mjs';

hljsSvelte(hljs);

export default function CodeBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code, language = 'svelte', class: className = undefined } = $$props;

		let highlighted = $.derived(() => {
			try {
				return hljs.highlight(code, { language }).value;
			} catch {
				return hljs.highlightAuto(code).value;
			}
		});

		$$renderer.push(`<pre${$.attr_class($.clsx(cn('overflow-x-auto rounded-lg border border-white/10 bg-[#0d1117] p-4 text-sm leading-relaxed shadow-sm', className)))}><code${$.attr_class(`hljs language-${$.stringify(language)} !bg-transparent !p-0`)}>${$.html(highlighted())}</code></pre>`);
	});
}