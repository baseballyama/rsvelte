import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Root } from '$lib/components/ui/avatar';
import { Avatar as AvatarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Chat_bubble_avatar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn("order-1 group-data-[variant='sent']/chat-bubble:order-2", $$props.class));

		Root($$anchor, $.spread_props(
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
	}

	$.pop();
}