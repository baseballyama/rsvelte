import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";
import { Popover } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Popover_content($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("rounded-card border-border shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-popover-content-transform-origin) z-50 border-2 bg-zinc-50 p-4 dark:bg-[#121212]", $$props.class));

		$.component(node, () => Popover.Content, ($$anchor, Popover_Content) => {
			Popover_Content($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}