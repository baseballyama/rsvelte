import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OutboundLink from "carbon-components-svelte/Link/OutboundLink.svelte";

var root = $.from_html(`<div data-testid="default"><!></div> <div data-testid="custom"><!></div> <div data-testid="empty"><!></div>`, 1);

export default function OutboundLink_test($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	OutboundLink(node, {
		href: 'https://www.carbondesignsystem.com/',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Carbon Design System');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	OutboundLink(node_1, {
		href: 'https://www.carbondesignsystem.com/',
		assistiveText: '(opens in a new window)',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Carbon Design System');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	OutboundLink(node_2, {
		href: 'https://www.carbondesignsystem.com/',
		assistiveText: '',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Carbon Design System');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.append($$anchor, fragment);
}