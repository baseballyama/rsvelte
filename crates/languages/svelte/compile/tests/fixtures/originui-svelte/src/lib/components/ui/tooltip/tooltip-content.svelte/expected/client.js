import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Tooltip } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref',
	'showArrow',
	'sideOffset'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Tooltip_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 11, null),
		showArrow = $.prop($$props, 'showArrow', 3, false),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Tooltip.Portal, ($$anchor, Tooltip_Portal) => {
		Tooltip_Portal($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn('bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-w-70 rounded-md border px-3 py-1.5 text-sm', $$props.class));

					$.component(node_1, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
						Tooltip_Content($$anchor, $.spread_props(
							{
								get ref() {
									return ref();
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
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_2 = $.first_child(fragment_2);

									$.snippet(node_2, () => $$props.children ?? $.noop);

									var node_3 = $.sibling(node_2, 2);

									{
										var consequent = ($$anchor) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Tooltip.Arrow, ($$anchor, Tooltip_Arrow) => {
												Tooltip_Arrow($$anchor, {
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
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}