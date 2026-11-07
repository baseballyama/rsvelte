import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar as AvatarPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'loadingStatus',
	'size',
	'class'
]);

export default function Avatar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		loadingStatus = $.prop($$props, 'loadingStatus', 15, 'loading'),
		size = $.prop($$props, 'size', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('after:border-border group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten', $$props.class));

		$.component(node, () => AvatarPrimitive.Root, ($$anchor, AvatarPrimitive_Root) => {
			AvatarPrimitive_Root($$anchor, $.spread_props(
				{
					'data-slot': 'avatar',
					get 'data-size'() {
						return size();
					},

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
					},

					get loadingStatus() {
						return loadingStatus();
					},

					set loadingStatus($$value) {
						loadingStatus($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}