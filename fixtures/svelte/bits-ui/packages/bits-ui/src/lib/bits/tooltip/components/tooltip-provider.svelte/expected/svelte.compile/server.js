import * as $ from 'svelte/internal/server';
import { boxWith } from "svelte-toolbelt";
import { TooltipProviderState } from "../tooltip.svelte.js";

export default function Tooltip_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			delayDuration = 700,
			disableCloseOnTriggerClick = false,
			disableHoverableContent = false,
			disabled = false,
			ignoreNonKeyboardFocus = false,
			skipDelayDuration = 300
		} = $$props;

		TooltipProviderState.create({
			delayDuration: boxWith(() => delayDuration),
			disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick),
			disableHoverableContent: boxWith(() => disableHoverableContent),
			disabled: boxWith(() => disabled),
			ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus),
			skipDelayDuration: boxWith(() => skipDelayDuration)
		});

		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}