import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { Dialog as SheetPrimitive } from 'bits-ui';
import { X } from '@lucide/svelte';
import SheetOverlay from './sheet-overlay.svelte';
import { cn } from '$lib/core/utils';

export const sheetVariants = tv({
	base: 'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 gap-4 p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
	variants: {
		side: {
			top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 border-b',
			bottom: 'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 border-t',
			left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
			right: 'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm'
		}
	},
	defaultVariants: { side: 'right' }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'side',
	'children'
]);

var root = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Sheet_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		side = $.prop($$props, 'side', 3, 'right'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => SheetPrimitive.Portal, ($$anchor, SheetPrimitive_Portal) => {
		SheetPrimitive_Portal($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				SheetOverlay(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => cn(sheetVariants({ side: side() }), $$props.class));

					$.component(node_2, () => SheetPrimitive.Content, ($$anchor, SheetPrimitive_Content) => {
						SheetPrimitive_Content($$anchor, $.spread_props(
							{
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
									var node_3 = $.first_child(fragment_2);

									$.snippet(node_3, () => $$props.children ?? $.noop);

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => SheetPrimitive.Close, ($$anchor, SheetPrimitive_Close) => {
										SheetPrimitive_Close($$anchor, {
											class: 'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = root();
												var node_5 = $.first_child(fragment_3);

												X(node_5, { class: 'size-4' });
												$.next(2);
												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
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
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}