import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select as SelectPrimitive } from 'bits-ui';
import SelectPortal from './select-portal.svelte';
import SelectScrollUpButton from './select-scroll-up-button.svelte';
import SelectScrollDownButton from './select-scroll-down-button.svelte';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'sideOffset',
	'portalProps',
	'children',
	'preventScroll'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Select_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		sideOffset = $.prop($$props, 'sideOffset', 3, 4),
		preventScroll = $.prop($$props, 'preventScroll', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	SelectPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn('bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 relative isolate z-50 min-w-36 overflow-x-hidden overflow-y-auto rounded-md shadow-md ring-1 duration-100', $$props.class));

				$.component(node, () => SelectPrimitive.Content, ($$anchor, SelectPrimitive_Content) => {
					SelectPrimitive_Content($$anchor, $.spread_props(
						{
							get sideOffset() {
								return sideOffset();
							},

							get preventScroll() {
								return preventScroll();
							},
							'data-slot': 'select-content',
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
								var node_1 = $.first_child(fragment_2);

								SelectScrollUpButton(node_1, {});

								var node_2 = $.sibling(node_1, 2);

								{
									let $0 = $.derived(() => cn('h-(--bits-select-anchor-height) w-full min-w-(--bits-select-anchor-width) scroll-my-1'));

									$.component(node_2, () => SelectPrimitive.Viewport, ($$anchor, SelectPrimitive_Viewport) => {
										SelectPrimitive_Viewport($$anchor, {
											get class() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_3 = $.first_child(fragment_3);

												$.snippet(node_3, () => $$props.children ?? $.noop);
												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
									});
								}

								var node_4 = $.sibling(node_2, 2);

								SelectScrollDownButton(node_4, {});
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