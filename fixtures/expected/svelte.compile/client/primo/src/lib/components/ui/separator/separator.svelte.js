import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Separator as SeparatorPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.ts';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'orientation'
]);

export default function Separator($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('bg-border shrink-0', orientation() === 'horizontal' ? 'h-[1px] w-full' : 'min-h-full w-[1px]', $$props.class));

		$.component(node, () => SeparatorPrimitive.Root, ($$anchor, SeparatorPrimitive_Root) => {
			SeparatorPrimitive_Root($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					},

					get orientation() {
						return orientation();
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