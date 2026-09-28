import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import { cn } from '$lib/utils.js';
import { Spinner } from '$lib/components/ui/spinner';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'variant',
	'size',
	'loading',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Alert_dialog_action($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'default'),
		size = $.prop($$props, 'size', 3, 'default'),
		loading = $.prop($$props, 'loading', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn(buttonVariants({ variant: variant(), size: size() }), 'cn-alert-dialog-action', $$props.class));

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
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								Spinner($$anchor, { 'data-icon': 'inline-start' });
							};

							$.if(node_1, ($$render) => {
								if (loading()) $$render(consequent);
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.snippet(node_2, () => $$props.children ?? $.noop);
						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}