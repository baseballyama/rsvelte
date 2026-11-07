import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AlertDialogOverlay from './alert-dialog-overlay.svelte';
import { cn } from '$lib/utils.js';
import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'portalProps',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Alert_dialog_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AlertDialogPrimitive.Portal, ($$anchor, AlertDialogPrimitive_Portal) => {
		AlertDialogPrimitive_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				AlertDialogOverlay(node_1, {});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => cn('bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100%-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-xl border p-6 shadow-lg duration-200 sm:max-w-100', $$props.class));

					$.component(node_2, () => AlertDialogPrimitive.Content, ($$anchor, AlertDialogPrimitive_Content) => {
						AlertDialogPrimitive_Content($$anchor, $.spread_props(
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
								}
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