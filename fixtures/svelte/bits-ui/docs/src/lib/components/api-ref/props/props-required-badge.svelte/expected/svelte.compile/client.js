import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Badge from "$lib/components/ui/badge.svelte";
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Props_required_badge($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn("border-destructive bg-background text-destructive border", $$props.class));

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

					var text = $.text('required');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}