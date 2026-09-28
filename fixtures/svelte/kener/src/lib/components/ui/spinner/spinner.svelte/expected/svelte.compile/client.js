import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import Loader2Icon from "@lucide/svelte/icons/loader-2";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Spinner($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn("size-4 animate-spin", $$props.class));

		Loader2Icon($$anchor, $.spread_props(
			{
				role: 'status',
				'aria-label': 'Loading',
				get class() {
					return $.get($0);
				}
			},
			() => restProps
		));
	}

	$.pop();
}