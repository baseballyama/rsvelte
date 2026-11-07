import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ResizablePrimitive from 'paneforge';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'this', 'class']);

export default function Resizable_pane_group($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		paneGroup = $.prop($$props, 'this', 15),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('cn-resizable-panel-group flex h-full w-full data-[direction=vertical]:flex-col', $$props.class));

		$.component(node, () => ResizablePrimitive.PaneGroup, ($$anchor, ResizablePrimitive_PaneGroup) => {
			$.bind_this(
				ResizablePrimitive_PaneGroup($$anchor, $.spread_props(
					{
						'data-slot': 'resizable-pane-group',
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
				)),
				($$value) => paneGroup($$value),
				() => paneGroup()
			);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}