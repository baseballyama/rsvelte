import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip } from "carbon-components-svelte";

var root = $.from_html(`<span data-testid="tooltip-content">Tooltip content</span>`);
var root_1 = $.from_html(`<button type="button" data-testid="toggle">Toggle tooltip</button> <!>`, 1);

export default function TooltipFixture($$anchor) {
	let open = false;
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Tooltip(node, {
		'data-testid': 'tooltip-wrapper',
		enterDelayMs: 0,
		leaveDelayMs: 0,
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	$.event('click', button, () => open = !open);
	$.append($$anchor, fragment);
}