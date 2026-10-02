import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<th>fruit</th> <th>qty</th> <th>price</th> <th>total</th>`, 1);
var root_1 = $.from_html(`<td> </td> <td> </td> <td> </td> <td> </td>`, 1);

export default function _7_passing_snippets_to_components_input($$anchor) {
	{
		const header = ($$anchor) => {
			var fragment_1 = root();

			$.next(6);
			$.append($$anchor, fragment_1);
		};

		const row = ($$anchor, d = $.noop) => {
			var fragment_2 = root_1();
			var td = $.first_child(fragment_2);
			var text = $.only_child(td, true);
			var td_1 = $.sibling(td, 2);
			var text_1 = $.only_child(td_1, true);
			var td_2 = $.sibling(td_1, 2);
			var text_2 = $.only_child(td_2, true);
			var td_3 = $.sibling(td_2, 2);
			var text_3 = $.only_child(td_3, true);

			$.template_effect(() => {
				$.set_text(text, d().name);
				$.set_text(text_1, d().qty);
				$.set_text(text_2, d().price);
				$.set_text(text_3, d().qty * d().price);
			});

			$.append($$anchor, fragment_2);
		};

		Table($$anchor, {
			data: fruits,
			header,
			row,
			$$slots: { header: true, row: true }
		});
	}
}