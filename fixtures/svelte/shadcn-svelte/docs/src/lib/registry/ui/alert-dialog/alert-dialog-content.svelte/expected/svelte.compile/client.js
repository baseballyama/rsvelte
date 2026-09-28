import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
import AlertDialogPortal from "./alert-dialog-portal.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'size',
	'portalProps'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Alert_dialog_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		size = $.prop($$props, 'size', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	AlertDialogPortal($$anchor, $.spread_props(() => $$props.portalProps, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AlertDialogOverlay(node, {});

			var node_1 = $.sibling(node, 2);

			{
				let $0 = $.derived(() => cn("cn-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none", $$props.class));

				$.component(node_1, () => AlertDialogPrimitive.Content, ($$anchor, AlertDialogPrimitive_Content) => {
					AlertDialogPrimitive_Content($$anchor, $.spread_props(
						{
							'data-slot': 'alert-dialog-content',
							get 'data-size'() {
								return size();
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