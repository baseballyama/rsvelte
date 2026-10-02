import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<th>fruit</th> <th>qty</th> <th>price</th> <th>total</th>`, 1);

export default function _8_passing_snippets_to_components_input($$anchor) {
	Table($$anchor, {
		data: fruits,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(6);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}