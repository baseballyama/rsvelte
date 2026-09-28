import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TooltipIcon from "carbon-components-svelte/TooltipIcon/TooltipIcon.svelte";
import Carbon from "carbon-icons-svelte/lib/Carbon.svelte";

var root = $.from_html(`<div style="margin: 50px;"><!></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function TooltipIconPortal_test($$anchor) {
	const directions = ["top", "right", "bottom", "left"];
	var div = root_1();

	$.each(div, 21, () => directions, $.index, ($$anchor, direction) => {
		var div_1 = root();
		var node = $.child(div_1);

		TooltipIcon(node, {
			portalTooltip: true,
			enterDelayMs: 0,
			leaveDelayMs: 0,
			get tooltipText() {
				return `Portal tooltip ${$.get(direction) ?? ''}`;
			},

			get direction() {
				return $.get(direction);
			},

			get icon() {
				return Carbon;
			}
		});

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
}