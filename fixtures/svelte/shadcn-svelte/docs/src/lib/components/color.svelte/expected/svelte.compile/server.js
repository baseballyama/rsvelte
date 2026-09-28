import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import ClipboardIcon from "@lucide/svelte/icons/clipboard";
import { toast } from "svelte-sonner";
import { UserConfigContext } from "$lib/user-config.svelte.js";

export default function Color($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { color, clipboard } = $$props;
		const userConfig = UserConfigContext.get();

		$$renderer.push(`<button class="group relative flex aspect-[3/1] w-full flex-1 cursor-pointer flex-col gap-2 text-(--text) sm:aspect-[2/3] sm:h-auto sm:w-auto [&amp;>svg]:absolute [&amp;>svg]:end-4 [&amp;>svg]:top-4 [&amp;>svg]:z-10 [&amp;>svg]:h-3.5 [&amp;>svg]:w-3.5 [&amp;>svg]:opacity-0 [&amp;>svg]:transition-opacity"${$.attr('data-last-copied', clipboard.lastCopied === color[userConfig.current.colorFormat])}${$.attr_style(`--bg: ${$.stringify(color.oklch)}; --text: ${$.stringify(color.foreground)};`)}>`);

		if (clipboard.copied) {
			$$renderer.push('<!--[0-->');

			CheckIcon($$renderer, {
				class: 'group-hover:opacity-100 group-data-[last-copied=true]:opacity-100'
			});
		} else {
			$$renderer.push('<!--[-1-->');
			ClipboardIcon($$renderer, { class: 'group-hover:opacity-100' });
		}

		$$renderer.push(`<!--]--> <div class="border-ghost w-full flex-1 rounded-md bg-(--bg) after:rounded-lg after:border-input md:rounded-lg"></div> <div class="flex w-full flex-col items-center justify-center gap-1"><span class="font-mono text-xs text-muted-foreground tabular-nums transition-colors group-hover:text-foreground group-data-[last-copied=true]:text-primary sm:hidden xl:flex">${$.escape(color.class)}</span> <span class="hidden font-mono text-xs text-muted-foreground tabular-nums transition-colors group-hover:text-foreground group-data-[last-copied=true]:text-primary sm:flex xl:hidden">${$.escape(color.scale)}</span></div></button>`);
	});
}