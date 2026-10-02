import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import * as Separator from '$lib/components/ui/separator';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);

export default function Demo_control_group_separator($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('data-[orientation=vertical]:h-4', $$props.class));

		$.component(node, () => Separator.Root, ($$anchor, Separator_Root) => {
			Separator_Root($$anchor, $.spread_props(
				{
					orientation: 'vertical',
					get class() {
						return $.get($0);
					}
				},
				() => rest
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}