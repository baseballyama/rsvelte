import * as $ from 'svelte/internal/server';
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";
import { slide } from "svelte/transition";
import ChevronRightSmall from "$lib/icons/chevron-right-small.svelte";

export default function CollapseCode($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code } = $$props;
		let isActive = false;

		const toggleFunc = () => {
			isActive = !isActive;
		};

		let rotate180 = $.derived(() => {
			if (isActive) {
				return "rotate-90";
			}

			return "";
		});

		let title = $.derived(() => {
			if (isActive) {
				return "Hide code";
			}

			return "Show code";
		});

		let border = $.derived(() => {
			if (isActive) {
				return "border-y";
			}

			return "border-t";
		});

		const highlightedCode = hljs.highlight(code, { language: "tsx" }).value;

		$$renderer.push(`<button${$.attr_class(`text-kui-light-gray-900 hover:text-kui-light-gray-1000 dark:text-kui-dark-gray-900 dark:hover:text-kui-dark-gray-1000 bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary h-12 w-full px-4 ${$.stringify(border())} border-kui-light-gray-200 dark:border-kui-dark-gray-400 cursor-pointer`)}><div class="flex items-center gap-x-2"><div${$.attr_class(`h-4 w-4 ${$.stringify(rotate180())} transform-gpu duration-200`)}>`);
		ChevronRightSmall($$renderer, {});
		$$renderer.push(`<!----></div> <span class="text-sm leading-5 font-normal first-letter:capitalize">${$.escape(title())}</span></div></button> `);

		if (isActive) {
			$$renderer.push(`<!--[0--><div class="ui-scrollbar text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 scroll-smoth h-auto w-full overflow-x-auto px-6 text-[13px]"><div><pre class="language-tsx">
            <code class="language-tsx">
                
                ${$.html(highlightedCode)}
            </code>
        </pre></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}