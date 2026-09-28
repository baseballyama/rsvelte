import * as $ from 'svelte/internal/server';
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte";
import { cn } from "$lib/utils";
import CodeIcon from "@lucide/svelte/icons/code";
import { Svelte, Terminal, CSS, TypeScript } from "$lib/components/icons";
import CheckIcon from "@lucide/svelte/icons/check";
import CopyIcon from "@lucide/svelte/icons/copy";
import Code from "$lib/components/ui/code/code.svelte";
import { scale } from "svelte/transition";

export default function DocsCodeBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import TerminalIcon from "@lucide/svelte/icons/terminal";
		let { code = "", fileName = "", lang = "bash", class: _class = "" } = $$props;

		let copyCode = new UseClipboard({ delay: 1000 });

		let handleCopy = async () => {
			await copyCode.copy(code);
		};

		$$renderer.push(`<div${$.attr_class($.clsx(cn("relative overflow-hidden rounded-xl border border-neutral-300/50 bg-neutral-200/30 dark:border-neutral-800/60 dark:bg-neutral-900/40", _class)))}>`);

		if (fileName) {
			$$renderer.push(`<!--[0--><div class="flex h-10 items-center justify-between border-b border-neutral-300/50 bg-neutral-200/30 pr-2.5 pl-4 dark:border-neutral-800/60 dark:bg-neutral-900/30"><div class="flex items-center gap-2">`);

			if (lang === "bash") {
				$$renderer.push('<!--[0-->');
				Terminal($$renderer, {});
			} else if (lang === "svelte") {
				$$renderer.push('<!--[1-->');
				Svelte($$renderer, {});
			} else if (lang === "css") {
				$$renderer.push('<!--[2-->');
				CSS($$renderer, {});
			} else if (lang === "typescript") {
				$$renderer.push('<!--[3-->');
				TypeScript($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
				CodeIcon($$renderer, { size: 14, class: 'text-neutral-500 dark:text-neutral-600' });
			}

			$$renderer.push(`<!--]--> <span class="text-[13px] leading-none font-medium text-neutral-500">${$.escape(fileName)}</span></div> <button class="relative flex h-7 w-7 items-center justify-center rounded-md text-foreground outline-none focus-visible:ring-1 dark:text-neutral-500 dark:focus-visible:ring-neutral-800">`);

			if (copyCode.status === "success") {
				$$renderer.push(`<!--[0--><span>`);
				CheckIcon($$renderer, { size: 14 });
				$$renderer.push(`<!----></span>`);
			} else {
				$$renderer.push(`<!--[-1--><span>`);
				CopyIcon($$renderer, { size: 14 });
				$$renderer.push(`<!----></span>`);
			}

			$$renderer.push(`<!--]--></button></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div>`);

		Code($$renderer, {
			class: 'no-scrollbar border-none [&_pre]:no-scrollbar',
			code,
			lang,
			hideLines: true
		});

		$$renderer.push(`<!----></div></div>`);
	});
}