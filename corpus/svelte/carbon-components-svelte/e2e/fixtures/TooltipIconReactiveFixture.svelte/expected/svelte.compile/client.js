import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TooltipIcon } from "carbon-components-svelte";
import Information from "carbon-icons-svelte/lib/Information.svelte";

var root = $.from_html(`<div data-testid="controlled-block"><button type="button" data-testid="toggle-controlled">Toggle controlled</button> <!> <span data-testid="open-event-count"> </span> <span data-testid="close-event-count"> </span></div> <div data-testid="pair-row"><!> <!></div>`, 1);

export default function TooltipIconReactiveFixture($$anchor) {
	let controlledOpen = false;
	let openEvents = 0;
	let closeEvents = 0;
	var fragment = root();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var node = $.sibling(button, 2);

	TooltipIcon(node, {
		'data-testid': 'tooltip-controlled',
		tooltipText: 'Controlled tooltip',
		get icon() {
			return Information;
		},
		portalTooltip: false,
		get open() {
			return controlledOpen;
		},

		set open($$value) {
			controlledOpen = $$value;
		},
		$$events: { open: () => openEvents += 1, close: () => closeEvents += 1 }
	});

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	TooltipIcon(node_1, {
		'data-testid': 'tooltip-a',
		tooltipText: 'Tooltip A text',
		get icon() {
			return Information;
		},
		portalTooltip: false
	});

	var node_2 = $.sibling(node_1, 2);

	TooltipIcon(node_2, {
		'data-testid': 'tooltip-b',
		tooltipText: 'Tooltip B text',
		get icon() {
			return Information;
		},
		portalTooltip: false
	});

	$.reset(div_1);

	$.template_effect(() => {
		$.set_text(text, openEvents);
		$.set_text(text_1, closeEvents);
	});

	$.event('click', button, () => controlledOpen = !controlledOpen);
	$.append($$anchor, fragment);
}