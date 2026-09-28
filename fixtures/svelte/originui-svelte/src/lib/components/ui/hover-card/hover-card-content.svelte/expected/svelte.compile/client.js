import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { LinkPreview as HoverCardPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'align',
	'children',
	'class',
	'portalProps',
	'ref',
	'showArrow',
	'sideOffset'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Hover_card_content($$anchor, $$props) {
	$.push($$props, true);

	let align = $.prop($$props, 'align', 3, 'center'),
		ref = $.prop($$props, 'ref', 15, null),
		showArrow = $.prop($$props, 'showArrow', 3, false),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => HoverCardPrimitive.Portal, ($$anchor, HoverCardPrimitive_Portal) => {
		HoverCardPrimitive_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn('border-border bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 rounded-lg border p-4 shadow-lg shadow-black/5 outline-hidden', $$props.class));

					$.component(node_1, () => HoverCardPrimitive.Content, ($$anchor, HoverCardPrimitive_Content) => {
						HoverCardPrimitive_Content($$anchor, $.spread_props(
							{
								get sideOffset() {
									return sideOffset();
								},

								get align() {
									return align();
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
									var fragment_2 = root();
									var node_2 = $.first_child(fragment_2);

									$.snippet(node_2, () => $$props.children);

									var node_3 = $.sibling(node_2, 2);

									{
										var consequent = ($$anchor) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => HoverCardPrimitive.Arrow, ($$anchor, HoverCardPrimitive_Arrow) => {
												HoverCardPrimitive_Arrow($$anchor, {
													class: 'text-popover -my-px drop-shadow-[0_1px_0_hsl(var(--border))]'
												});
											});

											$.append($$anchor, fragment_3);
										};

										$.if(node_3, ($$render) => {
											if (showArrow()) $$render(consequent);
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
	});

	$.append($$anchor, fragment);
	$.pop();
}