import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TooltipDefinition from "carbon-components-svelte/TooltipDefinition/TooltipDefinition.svelte";

var root = $.from_html(`<div style="margin: 50px;"><!></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function TooltipDefinitionPortal_test($$anchor) {
	const directions = ["top", "bottom"];
	var div = root_1();

	$.each(div, 21, () => directions, $.index, ($$anchor, direction) => {
		var div_1 = root();
		var node = $.child(div_1);

		TooltipDefinition(node, {
			portalTooltip: true,
			open: true,
			get tooltipText() {
				return `Portal tooltip ${$.get(direction) ?? ''}`;
			},

			get direction() {
				return $.get(direction);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text();

				$.template_effect(() => $.set_text(text, `Definition ${$.get(direction) ?? ''}`));
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