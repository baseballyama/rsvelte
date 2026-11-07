import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Link from "carbon-components-svelte/Link/Link.svelte";
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

var root = $.from_html(`<p>Distributes requests evenly across servers. <!></p>`);
var root_1 = $.from_html(`<div style="width: 230px;" data-testid="narrow-container"><!></div>`);

export default function TooltipNarrowContainerFixture($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Tooltip(node, {
		triggerText: 'Round robin',
		children: ($$anchor, $$slotProps) => {
			var p = root();
			var node_1 = $.sibling($.child(p));

			Link(node_1, {
				href: 'https://en.wikipedia.org/wiki/Round-robin_DNS',
				target: '_blank',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Read more on Wikipedia');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(p);
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}