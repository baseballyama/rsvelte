import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from "bits-ui";

var root = $.from_html(`<main><!> <input type="text" id="input" data-testid="input"/></main>`);

export default function Label_test($$anchor) {
	var main = root();
	var node = $.child(main);

	$.component(node, () => Label.Root, ($$anchor, Label_Root) => {
		Label_Root($$anchor, {
			for: 'input',
			'data-testid': 'label',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Label');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(main);
	$.append($$anchor, main);
}