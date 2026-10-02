import * as $ from 'svelte/internal/server';
import * as Code from "./index";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import Button from "$lib/components/ui/button/button.svelte";
import { cn } from "$lib/utils";
import { Svelte, TypeScript, Terminal } from "$lib/components/icons";

export default function Multiple_code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { code } = $$props;
		let selectedIndex = 0;
		let selectedCode = $.derived(() => code[selectedIndex]);

		$$renderer.push(`<div class="no-scrollbar flex overflow-auto rounded-md border"><div class="no-scrollbar hidden min-w-54 overflow-auto rounded-tl-md border-r bg-neutral-50 font-mono text-black [--color-background:var(--color-zinc-900)] [--color-foreground:white] [--color-muted:var(--color-zinc-800)] sm:block dark:bg-zinc-900/25 dark:text-white"><div><div class="flex items-center gap-1.5 py-2 pr-5.5 pl-4 font-mono text-xs hover:bg-white/5 dark:hover:bg-muted/50"><svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 16 16"><path fill="none" stroke="#cad3f5" stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5H12c.83 0 1.5.67 1.5 1.5v.5m-7.5 7H2A1.5 1.5 0 0 1 .5 12V3.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1"${$.attr('stroke-width', 1)}></path><path fill="none" stroke="#a6da95" stroke-linecap="round" stroke-linejoin="round" d="M8 10.278c0-.576.468-1.044 1.044-1.044h1.045v-.19a1.044 1.044 0 0 1 2.088 0v.19h1.045c.576 0 1.044.468 1.044 1.044v1.045h.19a1.044 1.044 0 1 1 0 2.088h-.19v1.045c0 .576-.468 1.044-1.044 1.044h-1.045v-.19a1.044 1.044 0 1 0-2.088 0v.19H8v-2.089h.19a1.044 1.044 0 0 0 0-2.088H8Z"${$.attr('stroke-width', 1)}></path></svg> <span>components</span></div> <!--[-->`);

		const each_array = $.ensure_array_like(code);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];

			Button($$renderer, {
				class: cn(`flex w-full items-center justify-start gap-1.5 rounded-none border-l-2 border-transparent pl-6! text-xs hover:bg-neutral-200/70 hover:dark:bg-zinc-900 [&_svg:not([class*='size-'])]:size-3`, selectedIndex === index && "border-l-2 border-muted-foreground bg-neutral-200/40 dark:bg-zinc-800/50"),
				variant: 'ghost',
				onclick: () => selectedIndex = index,
				children: ($$renderer) => {
					if (item.lang === "svelte") {
						$$renderer.push('<!--[0-->');
						Svelte($$renderer, { class: 'size-3' });
					} else if (item.lang === "typescript") {
						$$renderer.push('<!--[1-->');
						TypeScript($$renderer, { class: 'size-3' });
					} else {
						$$renderer.push('<!--[-1-->');
						Terminal($$renderer, { class: 'size-3' });
					}

					$$renderer.push(`<!--]--> <span${$.attr_class($.clsx([
						"transition-all duration-200",
						selectedIndex === index
							? "!text-black dark:!text-white"
							: "text-muted-foreground"
					]))}>${$.escape(item?.filename || "Svelte")}</span>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div></div> <div class="relative no-scrollbar max-h-[550px] min-h-[32rem] w-full overflow-auto border-none sm:w-full">`);

		if (Code.Root) {
			$$renderer.push('<!--[-->');

			Code.Root($$renderer, {
				lang: selectedCode().lang,
				class: 'relative no-scrollbar w-full rounded-none border-none',
				code: selectedCode().filecode,
				highlight: selectedCode().highlight,
				hideLines: selectedCode().hideLines,
				children: ($$renderer) => {
					if (Code.CopyButton) {
						$$renderer.push('<!--[-->');
						Code.CopyButton($$renderer, {});
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

		$$renderer.push(`</div></div>`);
	});
}