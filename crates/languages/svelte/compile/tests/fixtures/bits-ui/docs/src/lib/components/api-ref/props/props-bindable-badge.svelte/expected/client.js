import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from "$lib/components/ui/badge.svelte";
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Props_bindable_badge($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn("bg-background border border-[#2A266B] text-[#2A266B] dark:border-[#FCDAFE] dark:text-[#FCDAFE]", $$props.class));

		Badge($$anchor, $.spread_props(
			{
				get class() {
					return $.get($0);
				}
			},
			() => restProps,
			{
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('$bindable');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}