import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar as AvatarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'ref']);

export default function Avatar_fallback($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('bg-muted flex h-full w-full items-center justify-center rounded-full text-xs', $$props.class));

		$.component(node, () => AvatarPrimitive.Fallback, ($$anchor, AvatarPrimitive_Fallback) => {
			AvatarPrimitive_Fallback($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}