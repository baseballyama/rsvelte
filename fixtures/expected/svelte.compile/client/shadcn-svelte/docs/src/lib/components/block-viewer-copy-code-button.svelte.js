import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CheckIcon from "@lucide/svelte/icons/check";
import ClipboardIcon from "@lucide/svelte/icons/clipboard";
import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { BlockViewerContext } from "./block-viewer.svelte";

export default function Block_viewer_copy_code_button($$anchor, $$props) {
	$.push($$props, true);

	const ctx = BlockViewerContext.get();
	const clipboard = new UseClipboard();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			Button($$anchor, {
				onclick: () => {
					clipboard.copy(ctx.activeFileCodeToCopy);
				},
				class: 'size-7 shrink-0 rounded-md p-0 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white focus-visible:bg-zinc-700 focus-visible:text-white active:bg-zinc-700 active:text-white data-[active=true]:bg-zinc-700 data-[active=true]:text-white [&>svg]:size-3',
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							CheckIcon($$anchor, {});
						};

						var alternate = ($$anchor) => {
							ClipboardIcon($$anchor, {});
						};

						$.if(node_1, ($$render) => {
							if (clipboard.copied) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (ctx.activeFileCodeToCopy) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}