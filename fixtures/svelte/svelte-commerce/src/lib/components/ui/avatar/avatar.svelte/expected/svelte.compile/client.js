import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar as AvatarPrimitive } from 'bits-ui';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'ref',
	'loadingStatus'
]);

export default function Avatar($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		loadingStatus = $.prop($$props, 'loadingStatus', 15, 'loading'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', $$props.class));

		$.component(node, () => AvatarPrimitive.Root, ($$anchor, AvatarPrimitive_Root) => {
			AvatarPrimitive_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					get loadingStatus() {
						return loadingStatus();
					},

					set loadingStatus($$value) {
						loadingStatus($$value);
					},

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