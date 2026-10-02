import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Breakpoint, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <p>Resize the width of your browser.</p> <div><h6>Breakpoint size</h6> <h1> </h1></div> <div><h6>on:change</h6> <pre> </pre></div>`, 1);

export default function Breakpoint_1($$anchor) {
	let size;
	let events = [];

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Breakpoint(node, {
				get size() {
					return size;
				},

				set size($$value) {
					size = $$value;
				},
				$$events: { change: (e) => events = [...events, e.detail] }
			});

			var div = $.sibling(node, 4);
			var h1 = $.sibling($.child(div), 2);
			var text = $.only_child(h1, true);

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var pre = $.sibling($.child(div_1), 2);
			var text_1 = $.only_child(pre, true);

			$.reset(div_1);

			$.template_effect(
				($0) => {
					$.set_text(text, size);
					$.set_text(text_1, $0);
				},
				[() => JSON.stringify(events, null, 2)]
			);

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}