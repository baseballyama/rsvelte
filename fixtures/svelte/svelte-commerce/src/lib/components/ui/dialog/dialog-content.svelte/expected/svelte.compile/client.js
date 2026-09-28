import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dialog as DialogPrimitive } from 'bits-ui';
import { X } from '@lucide/svelte';
import * as Dialog from './index.js';
import { cn } from '$lib/core/utils/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<!> <span class="sr-only">Close</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Dialog_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Portal, ($$anchor, Dialog_Portal) => {
		Dialog_Portal($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
					Dialog_Overlay($$anchor, {});
				});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => cn('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg', $$props.class));

					$.component(node_2, () => DialogPrimitive.Content, ($$anchor, DialogPrimitive_Content) => {
						DialogPrimitive_Content($$anchor, $.spread_props(
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

									$.component(node_4, () => DialogPrimitive.Close, ($$anchor, DialogPrimitive_Close) => {
										DialogPrimitive_Close($$anchor, {
											class: 'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-none data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
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