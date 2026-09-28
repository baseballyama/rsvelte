import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Row from './Row.svelte';

var root = $.from_html(`<button>flip</button> <!>`, 1);

export default function Main($$anchor) {
	const items = $.proxy([{ id: 0 }, { id: 1 }, { id: 2 }]);
	const Table = { Row };
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.each(node, 17, () => items, (item) => item.id, ($$anchor, item) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => Table.Row, ($$anchor, Table_Row) => {
			Table_Row($$anchor, {
				get id() {
					return $.get(item).id;
				}
			});
		});

		$.append($$anchor, fragment_1);
	});

	$.delegated('click', button, () => items.reverse());
	$.append($$anchor, fragment);
}

$.delegate(['click']);