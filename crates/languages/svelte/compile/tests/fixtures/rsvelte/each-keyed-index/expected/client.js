import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);

var root_1 = $.from_html(`<div></div> <p>after</p>`, 1);

export default function Each_keyed_index($$anchor) {
	let rows = $.proxy([{ id: 'a' }, { id: 'b' }]);
	var fragment = root_1();
	var div = $.first_child(fragment);
	$.each(div, 23, () => rows, (row) => row.id, ($$anchor, row, index) => {
		var span = root();
		var text = $.only_child(span);
		$.template_effect(() => $.set_text(text, `${$.get(index) ?? ''}: ${$.get(row).id ?? ''}`));
		$.append($$anchor, span);
	});
	$.reset(div);
	$.next(2);
	$.append($$anchor, fragment);
}
