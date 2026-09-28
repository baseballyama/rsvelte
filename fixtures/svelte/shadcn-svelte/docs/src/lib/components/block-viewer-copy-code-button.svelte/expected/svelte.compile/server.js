import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import ClipboardIcon from "@lucide/svelte/icons/clipboard";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { BlockViewerContext } from "./block-viewer.svelte";

export default function Block_viewer_copy_code_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = BlockViewerContext.get();
		const clipboard = new UseClipboard();

		if (ctx.activeFileCodeToCopy) {
			$$renderer.push('<!--[0-->');

			Button($$renderer, {
				onclick: () => {
					clipboard.copy(ctx.activeFileCodeToCopy);
				},
				class: 'size-7 shrink-0 rounded-md p-0 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white focus-visible:bg-zinc-700 focus-visible:text-white active:bg-zinc-700 active:text-white data-[active=true]:bg-zinc-700 data-[active=true]:text-white [&>svg]:size-3',
				variant: 'ghost',
				children: ($$renderer) => {
					if (clipboard.copied) {
						$$renderer.push('<!--[0-->');
						CheckIcon($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
						ClipboardIcon($$renderer, {});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}