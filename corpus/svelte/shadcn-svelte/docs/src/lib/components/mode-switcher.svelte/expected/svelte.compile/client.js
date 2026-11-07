import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toggleMode } from "mode-watcher";
import Button from "$lib/registry/ui/button/button.svelte";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4.5"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path><path d="M12 3l0 18"></path><path d="M12 9l4.65 -4.65"></path><path d="M12 14.3l7.37 -7.37"></path><path d="M12 19.6l8.85 -8.85"></path></svg> <span class="sr-only">Toggle theme</span>`, 1);

export default function Mode_switcher($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => cn("group/toggle extend-touch-target size-8", $$props.class));

		Button($$anchor, {
			variant: 'ghost',
			size: 'icon',
			get class() {
				return $.get($0);
			},

			get onclick() {
				return toggleMode;
			},
			title: 'Toggle theme',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();

				$.next(2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}