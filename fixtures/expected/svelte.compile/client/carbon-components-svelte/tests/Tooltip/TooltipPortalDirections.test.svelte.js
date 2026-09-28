import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

var root = $.from_html(`<div style="margin: 50px;"><!></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function TooltipPortalDirections_test($$anchor) {
	const directions = ["top", "right", "bottom", "left"];
	var div = root_1();

	$.each(div, 21, () => directions, $.index, ($$anchor, direction) => {
		var div_1 = root();
		var node = $.child(div_1);

		Tooltip(node, {
			portalTooltip: true,
			open: true,
			get direction() {
				return $.get(direction);
			},
			iconDescription: 'Information',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `Portal tooltip ${$.get(direction) ?? ''}`));
				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
}