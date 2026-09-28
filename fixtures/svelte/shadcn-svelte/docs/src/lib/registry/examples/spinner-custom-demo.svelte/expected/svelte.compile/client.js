import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LoaderIcon from "@lucide/svelte/icons/loader";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Spinner_custom_demo($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn("size-4 animate-spin", $$props.class));

		LoaderIcon($$anchor, $.spread_props(
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