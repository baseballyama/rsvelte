import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SelectScrollDownButton from './select-scroll-down-button.svelte';
import SelectScrollUpButton from './select-scroll-up-button.svelte';
import { cn } from '$lib/utils.js';
import { Select as SelectPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'portalProps',
	'ref',
	'sideOffset'
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
					let $0 = $.derived(() => cn('border-input bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[min(24rem,var(--bits-select-content-available-height))] min-w-(--bits-select-anchor-width,8rem) overflow-hidden rounded-lg border shadow-lg shadow-black/5 [&_[role=group]]:py-1', $$props.class));

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

									SelectScrollUpButton(node_2, {});

									var node_3 = $.sibling(node_2, 2);

									{
										let $0 = $.derived(() => cn('p1 h-(--bits-select-anchor-height) p-1'));

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

									SelectScrollDownButton(node_5, {});
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