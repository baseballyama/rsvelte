import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GripVertical } from '@lucide/svelte';
import * as ResizablePrimitive from 'paneforge';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'withHandle']);
var root = $.from_html(`<div class="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border"><!></div>`);

export default function Resizable_handle($$anchor, $$props) {
	$.push($$props, true);

	let withHandle = $.prop($$props, 'withHandle', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:-translate-y-1/2 data-[direction=vertical]:after:translate-x-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 [&[data-direction=vertical]>div]:rotate-90', $$props.class));

		$.component(node, () => ResizablePrimitive.PaneResizer, ($$anchor, ResizablePrimitive_PaneResizer) => {
			ResizablePrimitive_PaneResizer($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
					}
				},
				() => restProps,
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								var div = root();
								var node_2 = $.child(div);

								GripVertical(node_2, { class: 'size-2.5' });
								$.reset(div);
								$.append($$anchor, div);
							};

							$.if(node_1, ($$render) => {
								if (withHandle()) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}