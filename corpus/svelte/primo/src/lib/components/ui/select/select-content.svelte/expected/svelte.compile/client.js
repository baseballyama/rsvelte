import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from 'bits-ui';
import * as Select from './index.js';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'sideOffset',
	'portalProps',
	'children'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Select_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SelectPrimitive.Portal, ($$anchor, SelectPrimitive_Portal) => {
		SelectPrimitive_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn('data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-popover text-popover-foreground relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1', $$props.class));

					$.component(node_1, () => SelectPrimitive.Content, ($$anchor, SelectPrimitive_Content) => {
						SelectPrimitive_Content($$anchor, $.spread_props(
							{
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
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var node_2 = $.first_child(fragment_2);

									$.component(node_2, () => Select.ScrollUpButton, ($$anchor, Select_ScrollUpButton) => {
										Select_ScrollUpButton($$anchor, {});
									});

									var node_3 = $.sibling(node_2, 2);

									{
										let $0 = $.derived(() => cn('h-[var(--bits-select-anchor-height)] w-full min-w-[var(--bits-select-anchor-width)] p-1'));

										$.component(node_3, () => SelectPrimitive.Viewport, ($$anchor, SelectPrimitive_Viewport) => {
											SelectPrimitive_Viewport($$anchor, {
												get class() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_3 = $.comment();
													var node_4 = $.first_child(fragment_3);

													$.snippet(node_4, () => $$props.children ?? $.noop);
													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});
									}

									var node_5 = $.sibling(node_3, 2);

									$.component(node_5, () => Select.ScrollDownButton, ($$anchor, Select_ScrollDownButton) => {
										Select_ScrollDownButton($$anchor, {});
									});

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