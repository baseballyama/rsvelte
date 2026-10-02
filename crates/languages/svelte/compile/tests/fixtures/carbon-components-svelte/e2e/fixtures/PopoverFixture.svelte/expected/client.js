import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Popover } from "carbon-components-svelte";

var root = $.from_html(`<div data-testid="popover-content">Popover content</div> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="popover-container" style="position: relative; display: inline-block"><!> <!></div> <div data-testid="outside" style="margin-top: 2rem; padding: 1rem">Click here to close</div>`, 1);

export default function PopoverFixture($$anchor) {
	let open = false;
	let containerRef;
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		'data-testid': 'open-popover',
		$$events: { click: () => open = !open },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Toggle popover');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Popover(node_1, {
		'data-testid': 'popover',
		align: 'bottom',
		closeOnOutsideClick: false,
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			'click:outside': ({ detail }) => {
				if (containerRef && !containerRef.contains(detail.target)) {
					open = false;
				}
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.sibling($.first_child(fragment_1), 2);

			Button(node_2, {
				'data-testid': 'close-popover',
				$$events: { click: () => open = false },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Close');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);
	$.next(2);
	$.append($$anchor, fragment);
}