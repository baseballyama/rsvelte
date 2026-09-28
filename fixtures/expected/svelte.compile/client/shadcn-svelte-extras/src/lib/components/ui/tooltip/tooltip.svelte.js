import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip as TooltipPrimitive } from 'bits-ui';
import TooltipProvider from './tooltip-provider.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open']);

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	TooltipProvider($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => TooltipPrimitive.Root, ($$anchor, TooltipPrimitive_Root) => {
				TooltipPrimitive_Root($$anchor, $.spread_props(() => restProps, {
					get open() {
						return open();
					},

					set open($$value) {
						open($$value);
					}
				}));
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}