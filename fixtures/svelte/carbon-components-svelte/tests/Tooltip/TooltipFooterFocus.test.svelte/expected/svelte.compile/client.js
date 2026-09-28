import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";
import TooltipFooter from "carbon-components-svelte/Tooltip/TooltipFooter.svelte";

var root = $.from_html(`<a href="/">Learn more</a> <button type="button">Manage</button>`, 1);
var root_1 = $.from_html(`<p>Resources are provisioned based on your account's organization.</p> <!>`, 1);

export default function TooltipFooterFocus_test($$anchor) {
	Tooltip($$anchor, {
		triggerText: 'Resource list',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.sibling($.first_child(fragment_1), 2);

			TooltipFooter(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();

					$.next(2);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}