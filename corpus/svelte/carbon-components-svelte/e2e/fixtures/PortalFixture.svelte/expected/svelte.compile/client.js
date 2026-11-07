import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal } from "carbon-components-svelte";

var root = $.from_html(`<span data-testid="portal-inner">Portal content</span>`);
var root_1 = $.from_html(`<div data-testid="source"><!></div>`);

export default function PortalFixture($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Portal(node, {
		'data-testid': 'portal-content',
		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}