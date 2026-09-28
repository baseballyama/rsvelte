import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Popover } from "carbon-components-svelte";

var root = $.from_html(`<div><!> <!></div>`);

export default function WithButton($$anchor) {
	let open = true;
	let ref = null;
	var div = root();

	$.set_style(div, '', {}, { position: 'relative' });

	var node = $.child(div);

	Button(node, {
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
		align: 'bottom-left',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			'click:outside': ({ detail }) => {
				console.log("on:click:outside");
				open = ref.contains(detail.target);
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Content');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_this(div, ($$value) => ref = $$value, () => ref);
	$.append($$anchor, div);
}