import * as $ from 'svelte/internal/server';
import { HighlightSvelte, Highlight } from "svelte-rune-highlight";
import markdown from "highlight.js/lib/languages/markdown";
import { Clipboard } from "flowbite-svelte";
import { replaceLibImport } from "./helpers";
import { highlightcompo } from "./theme";

export default function HighlightCompo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import clsx from "clsx";
		// componentStatus: boolean;
		let {
			code,
			codeLang,
			contentClass = "overflow-hidden",
			replaceLib = "runes-webkit",
			class: className
		} = $$props;

		let value = $.derived(() => replaceLib ? replaceLibImport(code, replaceLib) : code);
		let showExpandButton = false;
		let expand = false;

		const checkOverflow = (el) => {
			const isOverflowingY = el.clientHeight < el.scrollHeight;

			showExpandButton = isOverflowingY;
		};

		// const base = $derived(highlightcompo({ class: clsx(className) }));
		const base = $.derived(() => highlightcompo({ class: className }));

		const handleExpandClick = () => {
			expand = !expand;
		};

		const mdLang = { name: "markdown", register: markdown };
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(base()))}><div${$.attr_class(`${$.stringify(contentClass)} ${showExpandButton ? 'pb-8' : ''}`, void 0, { 'max-h-72': !expand })} tabindex="-1">`);

			{
				function children($$renderer, success) {
					if (success) {
						$$renderer.push(`<!--[0-->Copied`);
					} else {
						$$renderer.push(`<!--[-1-->Copy`);
					}

					$$renderer.push(`<!--]-->`);
				}

				Clipboard($$renderer, {
					size: 'xs',
					color: 'alternative',
					class: 'absolute top-8 right-2 w-20 bg-gray-50 focus:ring-0 dark:bg-gray-800',
					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
						$$settled = false;
					},
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----> `);

			if (codeLang === "md") {
				$$renderer.push('<!--[0-->');
				Highlight($$renderer, { language: mdLang, code: value(), class: 'm-0 p-0' });
			} else if (value()) {
				$$renderer.push('<!--[1-->');
				HighlightSvelte($$renderer, { code: value(), class: 'm-0 p-0' });
			} else {
				$$renderer.push(`<!--[-1-->no code is provided`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (showExpandButton) {
				$$renderer.push(`<!--[0--><button type="button" class="hover:text-primary-700 absolute start-0 bottom-0 w-full border-t border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">${$.escape(expand ? "Collapse code" : "Expand code")}</button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}