import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Command as CommandPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref']);

export default function Command_empty($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 11, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('py-6 text-center text-sm', $$props.class));

		$.component(node, () => CommandPrimitive.Empty, ($$anchor, CommandPrimitive_Empty) => {
			CommandPrimitive_Empty($$anchor, $.spread_props(
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