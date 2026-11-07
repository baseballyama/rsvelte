import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { TooltipRootState } from "../tooltip.svelte.js";
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";
import { noop } from "$lib/internal/noop.js";

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		triggerId = $.prop($$props, 'triggerId', 15, null),
		onOpenChange = $.prop($$props, 'onOpenChange', 3, noop),
		onOpenChangeComplete = $.prop($$props, 'onOpenChangeComplete', 3, noop);

	const rootState = TooltipRootState.create({
		open: boxWith(() => open(), (v) => {
			open(v);
			onOpenChange()(v);
		}),

		triggerId: boxWith(() => triggerId(), (v) => {
			triggerId(v);
		}),
		delayDuration: boxWith(() => $$props.delayDuration),
		disableCloseOnTriggerClick: boxWith(() => $$props.disableCloseOnTriggerClick),
		disableHoverableContent: boxWith(() => $$props.disableHoverableContent),
		ignoreNonKeyboardFocus: boxWith(() => $$props.ignoreNonKeyboardFocus),
		disabled: boxWith(() => $$props.disabled),
		onOpenChangeComplete: boxWith(() => onOpenChangeComplete()),
		tether: boxWith(() => $$props.tether)
	});

	FloatingLayer($$anchor, {
		tooltip: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.snippet(node, () => $$props.children ?? $.noop, () => ({
				open: rootState.opts.open.current,
				triggerId: rootState.activeTriggerId,
				payload: rootState.activePayload
			}));

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}