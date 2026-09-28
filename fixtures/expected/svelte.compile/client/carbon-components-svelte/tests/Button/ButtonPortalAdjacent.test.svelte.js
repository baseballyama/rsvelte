import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "carbon-components-svelte/Button/Button.svelte";
import Add from "carbon-icons-svelte/lib/Add.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ButtonPortalAdjacent_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		'data-testid': 'btn-portal-a',
		get icon() {
			return Add;
		},
		portalTooltip: true,
		tooltipPosition: 'top',
		iconDescription: 'Tooltip A'
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		'data-testid': 'btn-portal-b',
		get icon() {
			return Add;
		},
		portalTooltip: true,
		tooltipPosition: 'top',
		iconDescription: 'Tooltip B'
	});

	$.append($$anchor, fragment);
}