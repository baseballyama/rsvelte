import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClickableTile, Stack } from "carbon-components-svelte";

var root = $.from_html(`<div>Clicked: <strong> </strong></div> <!>`, 1);

export default function ReactiveClickableTile($$anchor) {
	let clicked = false;

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var div = $.first_child(fragment_1);
			var strong = $.sibling($.child(div));
			var text = $.only_child(strong, true);

			$.reset(div);

			var node = $.sibling(div, 2);

			ClickableTile(node, {
				get clicked() {
					return clicked;
				},

				set clicked($$value) {
					clicked = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Click this tile');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => $.set_text(text, clicked));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}