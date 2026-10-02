import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { TooltipRootState } from "../tooltip.svelte.js";
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";
import { noop } from "$lib/internal/noop.js";

export default function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			open = false,
			triggerId = null,
			onOpenChange = noop,
			onOpenChangeComplete = noop,
			disabled,
			delayDuration,
			disableCloseOnTriggerClick,
			disableHoverableContent,
			ignoreNonKeyboardFocus,
			tether,
			children
		} = $$props;

		const rootState = TooltipRootState.create({
			open: boxWith(() => open, (v) => {
				open = v;
				onOpenChange(v);
			}),

			triggerId: boxWith(() => triggerId, (v) => {
				triggerId = v;
			}),
			delayDuration: boxWith(() => delayDuration),
			disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick),
			disableHoverableContent: boxWith(() => disableHoverableContent),
			ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus),
			disabled: boxWith(() => disabled),
			onOpenChangeComplete: boxWith(() => onOpenChangeComplete),
			tether: boxWith(() => tether)
		});

		FloatingLayer($$renderer, {
			tooltip: true,
			children: ($$renderer) => {
				children?.($$renderer, {
					open: rootState.opts.open.current,
					triggerId: rootState.activeTriggerId,
					payload: rootState.activePayload
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { open, triggerId });
	});
}