import * as $ from 'svelte/internal/server';
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";

export default function CodeSnip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code, lang = "tsx", language = "language-tsx" } = $$props;
		const highlightedCode = hljs.highlight(code, { language: lang }).value;

		$$renderer.push(`<div class="ui-scrollbar scroll-smoth h-auto w-full overflow-x-auto px-6 text-[13px]"><pre${$.attr_class($.clsx(language))}>
        <code${$.attr_class($.clsx(language))}>
            
            ${$.html(highlightedCode)}
        </code>
    </pre></div>`);
	});
}