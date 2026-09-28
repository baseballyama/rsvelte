import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { TooltipProviderState } from "../tooltip.svelte.js";

export default function Tooltip_provider($$anchor, $$props) {
	$.push($$props, true);

	let delayDuration = $.prop($$props, 'delayDuration', 3, 700),
		disableCloseOnTriggerClick = $.prop($$props, 'disableCloseOnTriggerClick', 3, false),
		disableHoverableContent = $.prop($$props, 'disableHoverableContent', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		ignoreNonKeyboardFocus = $.prop($$props, 'ignoreNonKeyboardFocus', 3, false),
		skipDelayDuration = $.prop($$props, 'skipDelayDuration', 3, 300);

	TooltipProviderState.create({
		delayDuration: boxWith(() => delayDuration()),
		disableCloseOnTriggerClick: boxWith(() => disableCloseOnTriggerClick()),
		disableHoverableContent: boxWith(() => disableHoverableContent()),
		disabled: boxWith(() => disabled()),
		ignoreNonKeyboardFocus: boxWith(() => ignoreNonKeyboardFocus()),
		skipDelayDuration: boxWith(() => skipDelayDuration())
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}