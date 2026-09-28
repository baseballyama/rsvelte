import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'variant',
	'size'
]);

export default function Alert_dialog_action($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "default"),
		size = $.prop($$props, 'size', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: variant(), size: size() }), "cn-alert-dialog-action", $$props.class));

		$.component(node, () => AlertDialogPrimitive.Action, ($$anchor, AlertDialogPrimitive_Action) => {
			AlertDialogPrimitive_Action($$anchor, $.spread_props(
				{
					'data-slot': 'alert-dialog-action',
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

	$.append($$anchor, fragment);
	$.pop();
}