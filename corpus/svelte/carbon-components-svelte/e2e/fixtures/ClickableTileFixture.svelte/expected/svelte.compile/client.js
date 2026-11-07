import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClickableTile } from "carbon-components-svelte";

var root = $.from_html(`<!> <div data-testid="clicked-state"> </div>`, 1);

export default function ClickableTileFixture($$anchor) {
	let clicked = false;
	var fragment = root();
	var node = $.first_child(fragment);

	ClickableTile(node, {
		'data-testid': 'clickable-tile',
		get clicked() {
			return clicked;
		},

		set clicked($$value) {
			clicked = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Clickable tile content');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var text_1 = $.only_child(div, true);

	$.template_effect(() => $.set_text(text_1, clicked));
	$.append($$anchor, fragment);
}