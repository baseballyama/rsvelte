import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip as TooltipPrimitive } from 'bits-ui';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'delayDuration']);

export default function Tooltip_provider($$anchor, $$props) {
	let delayDuration = $.prop($$props, 'delayDuration', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => TooltipPrimitive.Provider, ($$anchor, TooltipPrimitive_Provider) => {
		TooltipPrimitive_Provider($$anchor, $.spread_props(
			{
				get delayDuration() {
					return delayDuration();
				}
			},
			() => restProps
		));
	});

	$.append($$anchor, fragment);
}