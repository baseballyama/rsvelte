import * as $ from 'svelte/internal/server';
import { Highlight } from "svelte-rune-highlight";
import markdown from "highlight.js/lib/languages/markdown";
import { Button, Badge } from "$lib";
import { copyToClipboard, replaceLibImport } from "./helpers";
import { highlightcompo } from "./theme";

export default function DynamicCodeBlockHighlight($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// componentStatus: boolean;
		let {
			code,
			handleExpandClick,
			showExpandButton,
			expand,
			codeLang,
			badgeClass,
			buttonClass,
			replaceLib,
			class: className
		} = $$props;

		let processedCode = $.derived(() => replaceLib ? replaceLibImport(code) : code);

		const $$d = $.derived(highlightcompo),
			base = $.derived(() => $$d().base),
			badge = $.derived(() => $$d().badge),
			button = $.derived(() => $$d().button);

		let copiedStatus = false;

		function handleCopyClick() {
			copyToClipboard(processedCode()).then(() => {
				copiedStatus = true;

				setTimeout(
					() => {
						copiedStatus = false;
					},
					1000
				);
			}).catch((err) => {
				console.error("Error in copying:", err);

				// Handle the error as needed
			});
		}

		const mdLang = { name: "markdown", register: markdown };

		$$renderer.push(`<div${$.attr_class($.clsx(base()({ className })))}><div class="relative"><div${$.attr_class(`overflow-hidden ${showExpandButton ? 'pb-8' : ''}`, void 0, { 'max-h-56': !expand })} tabindex="-1">`);

		if (copiedStatus) {
			$$renderer.push('<!--[0-->');

			Badge($$renderer, {
				class: badge()({ class: badgeClass }),
				color: 'green',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Copied to clipboard`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (codeLang === "md") {
			$$renderer.push('<!--[0-->');
			Highlight($$renderer, { language: mdLang, code: processedCode() });
		} else if (processedCode()) {
			$$renderer.push(`<!--[1--><div class="highlight"><pre class="language-svelte !-mt-2 mb-0 !rounded-none">${$.escape(processedCode())}</pre></div>`);
		} else {
			$$renderer.push(`<!--[-1-->no code is provided`);
		}

		$$renderer.push(`<!--]--></div> `);

		Button($$renderer, {
			class: button()({ class: buttonClass }),
			onclick: handleCopyClick,
			children: ($$renderer) => {
				$$renderer.push(`<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z"></path><path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"></path></svg>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (showExpandButton) {
			$$renderer.push(`<!--[0--><button type="button" class="hover:text-primary-700 absolute start-0 bottom-0 w-full border-t border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">${$.escape(expand ? "Collapse code" : "Expand code")}</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}