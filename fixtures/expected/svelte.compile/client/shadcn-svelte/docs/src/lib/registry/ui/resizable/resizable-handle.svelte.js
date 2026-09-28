import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ResizablePrimitive from "paneforge";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'withHandle'
]);

var root = $.from_html(`<div class="cn-resizable-handle-icon z-10 flex shrink-0"></div>`);

export default function Resizable_handle($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		withHandle = $.prop($$props, 'withHandle', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("cn-resizable-handle relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-hidden data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-1 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:translate-x-0 data-[direction=vertical]:after:-translate-y-1/2 [&[data-direction=vertical]>div]:rotate-90", $$props.class));

		$.component(node, () => ResizablePrimitive.PaneResizer, ($$anchor, ResizablePrimitive_PaneResizer) => {
			ResizablePrimitive_PaneResizer($$anchor, $.spread_props(
				{
					'data-slot': 'resizable-handle',
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

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								var div = root();

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