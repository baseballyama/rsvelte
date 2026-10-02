import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LinkPreview as HoverCardPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import HoverCardPortal from './hover-card-portal.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'align',
	'sideOffset',
	'portalProps'
]);

export default function Hover_card_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		align = $.prop($$props, 'align', 3, 'center'),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		restProps = $.rest_props($$props, rest_excludes);

	HoverCardPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn('data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground z-50 w-64 origin-(--transform-origin) rounded-lg p-4 text-sm shadow-md ring-1 outline-hidden duration-100', $$props.class));

				$.component(node, () => HoverCardPrimitive.Content, ($$anchor, HoverCardPrimitive_Content) => {
					HoverCardPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'hover-card-content',
							get align() {
								return align();
							},

							get sideOffset() {
								return sideOffset();
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
							}
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