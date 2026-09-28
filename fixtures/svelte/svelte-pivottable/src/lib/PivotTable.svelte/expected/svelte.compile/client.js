import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TableRenderers from "./TableRenderers";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'renderer']);

export default function PivotTable($$anchor, $$props) {
	$.push($$props, true);

	let Renderer = $.prop($$props, 'renderer', 19, () => TableRenderers.Table),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, Renderer, ($$anchor, Renderer_1) => {
		Renderer_1($$anchor, $.spread_props(() => restProps));
	});

	$.append($$anchor, fragment);
	$.pop();
}