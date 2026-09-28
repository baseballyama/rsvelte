import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip as TooltipPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import TooltipPortal from './tooltip-portal.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'sideOffset',
	'side',
	'children',
	'arrowClasses',
	'portalProps'
]);

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		sideOffset = $.prop($$props, 'sideOffset', 3, 0),
		side = $.prop($$props, 'side', 3, 'top'),
		restProps = $.rest_props($$props, rest_excludes);

	TooltipPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn('data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-foreground text-background z-50 inline-flex w-fit max-w-xs origin-(--bits-tooltip-content-transform-origin) items-center gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm', $$props.class));

				$.component(node, () => TooltipPrimitive.Content, ($$anchor, TooltipPrimitive_Content) => {
					TooltipPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'tooltip-content',
							get sideOffset() {
								return sideOffset();
							},

							get side() {
								return side();
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

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_1 = $.first_child(fragment_2);

								$.snippet(node_1, () => $$props.children ?? $.noop);

								var node_2 = $.sibling(node_1, 2);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;
										var div = root();

										$.attribute_effect(div, ($0) => ({ class: $0, ...props() }), [
											() => cn('bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]', 'data-[side=top]:translate-x-1/2 data-[side=top]:translate-y-[calc(-50%+2px)]', 'data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:-translate-y-[calc(-50%+1px)]', 'data-[side=right]:translate-x-[calc(50%+2px)] data-[side=right]:translate-y-1/2', 'data-[side=left]:-translate-y-[calc(50%-3px)]', $$props.arrowClasses)
										]);

										$.append($$anchor, div);
									};

									$.component(node_2, () => TooltipPrimitive.Arrow, ($$anchor, TooltipPrimitive_Arrow) => {
										TooltipPrimitive_Arrow($$anchor, { child, $$slots: { child: true } });
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}
					));
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	}));

	$.pop();
}