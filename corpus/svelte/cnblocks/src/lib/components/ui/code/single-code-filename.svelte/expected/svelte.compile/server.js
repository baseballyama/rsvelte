import * as $ from 'svelte/internal/server';
import { TypeScript } from "$lib/components/icons";
import { Svelte, Terminal, CSS, Markdown } from "$lib/components/icons";
import * as Code from "$lib/components/ui/code";
import CopyButton from "../copy-button/copy-button.svelte";

export default function Single_code_filename($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code } = $$props;

		$$renderer.push(`<div class="w-full"><div class="overflow-hidden rounded-lg border border-border"><div class="flex items-center justify-between border-b border-border py-1 pr-1 pl-4"><div class="flex items-center gap-1.5">`);

		if (code.lang === "svelte") {
			$$renderer.push('<!--[0-->');
			Svelte($$renderer, {});
		} else if (code.lang === "typescript") {
			$$renderer.push('<!--[1-->');
			TypeScript($$renderer, {});
		} else if (code.lang === "css") {
			$$renderer.push('<!--[2-->');
			CSS($$renderer, {});
		} else if (code.lang === "markdown") {
			$$renderer.push('<!--[3-->');
			Markdown($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
			Terminal($$renderer, {});
		}

		$$renderer.push(`<!--]--> <span class="text-sm font-normal">${$.escape(code.filename)}</span></div> <div>`);
		CopyButton($$renderer, { text: code.filecode });
		$$renderer.push(`<!----></div></div> `);

		if (code.isExpand) {
			$$renderer.push('<!--[0-->');

			if (Code.Overflow) {
				$$renderer.push('<!--[-->');

				Code.Overflow($$renderer, {
					collapsed: true,
					children: ($$renderer) => {
						if (Code.Root) {
							$$renderer.push('<!--[-->');

							Code.Root($$renderer, {
								lang: code.lang,
								class: 'w-full rounded-none border-none',
								code: code.filecode,
								highlight: code.highlight,
								hideLines: code.hideLines
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');

			if (Code.Root) {
				$$renderer.push('<!--[-->');

				Code.Root($$renderer, {
					lang: code.lang,
					class: 'w-full rounded-none border-none',
					code: code.filecode,
					highlight: code.highlight,
					hideLines: code.hideLines
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}